document.addEventListener('DOMContentLoaded', () => {
    const queueList = document.getElementById('queueList');
    const queueCountSpan = document.getElementById('queueCount');
    const cashier1StatusSpan = document.getElementById('cashier1Status');
    const cashier1CustomerSpan = document.getElementById('cashier1Customer');
    const cashier1TimeSpan = document.getElementById('cashier1Time');
    const totalCustomersArrivedSpan = document.getElementById('totalCustomersArrived');
    const totalCustomersServedSpan = document.getElementById('totalCustomersServed');
    const averageWaitingTimeSpan = document.getElementById('averageWaitingTime');

    const arrivalRateInput = document.getElementById('arrivalRate');
    const serviceMinInput = document.getElementById('serviceMin');
    const serviceMaxInput = document.getElementById('serviceMax');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resetButton = document.getElementById('resetButton');

    let queue = [];
    let customerId = 0;
    let totalCustomersArrived = 0;
    let totalCustomersServed = 0;
    let totalWaitingTime = 0; // Untuk menghitung rata-rata waktu tunggu

    let simulationInterval;
    let customerArrivalInterval;
    let cashierInterval;

    let cashier = {
        isBusy: false,
        servingCustomer: null,
        remainingServiceTime: 0,
        customerArrivalTime: 0 // Waktu pelanggan masuk antrian
    };

    // --- Fungsi Bantuan ---
    function getRandomServiceTime(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateQueueDisplay() {
        queueList.innerHTML = '';
        if (queue.length === 0) {
            queueList.innerHTML = '<p style="text-align: center; color: #888;">Antrian kosong</p>';
        } else {
            queue.forEach((customer, index) => {
                const customerDiv = document.createElement('div');
                customerDiv.classList.add('customer-item');
                customerDiv.innerHTML = `Pelanggan <span>#${customer.id}</span> (Antri: ${customer.waitingTime}s)`;
                queueList.appendChild(customerDiv);
            });
        }
        queueCountSpan.textContent = queue.length;
    }

    function updateCashierDisplay() {
        if (cashier.isBusy) {
            cashier1StatusSpan.textContent = 'Sibuk';
            cashier1StatusSpan.classList.remove('status-ready');
            cashier1StatusSpan.classList.add('status-busy');
            cashier1CustomerSpan.textContent = `Pelanggan #${cashier.servingCustomer.id}`;
            cashier1TimeSpan.textContent = cashier.remainingServiceTime;
        } else {
            cashier1StatusSpan.textContent = 'Siap Melayani';
            cashier1StatusSpan.classList.remove('status-busy');
            cashier1StatusSpan.classList.add('status-ready');
            cashier1CustomerSpan.textContent = 'Tidak ada';
            cashier1TimeSpan.textContent = '0';
        }
    }

    function updateMetricsDisplay() {
        totalCustomersArrivedSpan.textContent = totalCustomersArrived;
        totalCustomersServedSpan.textContent = totalCustomersServed;
        if (totalCustomersServed > 0) {
            averageWaitingTimeSpan.textContent = (totalWaitingTime / totalCustomersServed).toFixed(2);
        } else {
            averageWaitingTimeSpan.textContent = '0.00';
        }
    }

    // --- Logika Simulasi ---

    function addNewCustomer() {
        customerId++;
        totalCustomersArrived++;
        const newCustomer = {
            id: customerId,
            arrivalTime: Date.now(), // Waktu pelanggan tiba
            waitingTime: 0 // Akan dihitung saat di antrian
        };
        queue.push(newCustomer);
        console.log(`[${(Date.now() / 1000).toFixed(0)}s] Pelanggan #${newCustomer.id} datang. Antrian: ${queue.length}`);
        updateQueueDisplay();
        updateMetricsDisplay();
    }

    function processCashier() {
        // Kasir sibuk
        if (cashier.isBusy) {
            cashier.remainingServiceTime--;
            if (cashier.remainingServiceTime <= 0) {
                console.log(`[${(Date.now() / 1000).toFixed(0)}s] Pelanggan #${cashier.servingCustomer.id} selesai dilayani oleh Kasir 1.`);
                totalCustomersServed++;
                totalWaitingTime += (Date.now() - cashier.servingCustomer.arrivalTime) / 1000; // Hitung waktu tunggu total
                cashier.isBusy = false;
                cashier.servingCustomer = null;
            }
        }

        // Kasir siap melayani dan ada pelanggan di antrian
        if (!cashier.isBusy && queue.length > 0) {
            const nextCustomer = queue.shift(); // Pelanggan pertama keluar antrian
            const serviceTime = getRandomServiceTime(
                parseInt(serviceMinInput.value),
                parseInt(serviceMaxInput.value)
            );
            cashier.isBusy = true;
            cashier.servingCustomer = nextCustomer;
            cashier.remainingServiceTime = serviceTime;
            // Update waktu tunggu pelanggan yang akan dilayani
            nextCustomer.waitingTime = ((Date.now() - nextCustomer.arrivalTime) / 1000).toFixed(0);

            console.log(`[${(Date.now() / 1000).toFixed(0)}s] Kasir 1 mulai melayani Pelanggan #${nextCustomer.id} selama ${serviceTime} detik.`);
        }

        // Untuk setiap pelanggan di antrian, tambahkan waktu tunggu
        queue.forEach(customer => {
            customer.waitingTime++;
        });

        updateQueueDisplay();
        updateCashierDisplay();
        updateMetricsDisplay();
    }

    function startSimulation() {
        const arrivalRate = parseInt(arrivalRateInput.value) * 1000; // Ubah ke ms
        if (isNaN(arrivalRate) || arrivalRate <= 0) {
            alert("Tingkat Kedatangan Pelanggan harus angka positif.");
            return;
        }

        startButton.disabled = true;
        stopButton.disabled = false;
        arrivalRateInput.disabled = true;
        serviceMinInput.disabled = true;
        serviceMaxInput.disabled = true;
        resetButton.disabled = true; // Disable reset while running

        // Interval untuk pelanggan baru datang
        customerArrivalInterval = setInterval(addNewCustomer, arrivalRate);

        // Interval untuk proses kasir (dan update antrian)
        cashierInterval = setInterval(processCashier, 1000); // Setiap 1 detik
        console.log("Simulasi dimulai.");
    }

    function stopSimulation() {
        clearInterval(customerArrivalInterval);
        clearInterval(cashierInterval);
        startButton.disabled = false;
        stopButton.disabled = true;
        arrivalRateInput.disabled = false;
        serviceMinInput.disabled = false;
        serviceMaxInput.disabled = false;
        resetButton.disabled = false; // Enable reset after stopping
        console.log("Simulasi dihentikan.");
    }

    function resetSimulation() {
        stopSimulation();
        queue = [];
        customerId = 0;
        totalCustomersArrived = 0;
        totalCustomersServed = 0;
        totalWaitingTime = 0;
        cashier = {
            isBusy: false,
            servingCustomer: null,
            remainingServiceTime: 0,
            customerArrivalTime: 0
        };
        updateQueueDisplay();
        updateCashierDisplay();
        updateMetricsDisplay();
        startButton.disabled = false;
        stopButton.disabled = true;
        arrivalRateInput.disabled = false;
        serviceMinInput.disabled = false;
        serviceMaxInput.disabled = false;
        resetButton.disabled = false;
        console.log("Simulasi direset.");
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startSimulation);
    stopButton.addEventListener('click', stopSimulation);
    resetButton.addEventListener('click', resetSimulation);

    // Initial display update
    updateQueueDisplay();
    updateCashierDisplay();
    updateMetricsDisplay();
});