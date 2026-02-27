// ====== CURRENCY FORMATTER (INDIA) ======
// This ensures correct formatting: ₹1,00,000.00
const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
});

// ====== DATA STORE (LocalStorage) ======
const DB = {
    // Fixed: Changed '₹' back to '$' for valid JavaScript syntax
    get: (key) => JSON.parse(localStorage.getItem(`medicore_${key}`)) || null,
    set: (key, value) => localStorage.setItem(`medicore_${key}`, JSON.stringify(value)),
    remove: (key) => localStorage.removeItem(`medicore_${key}`)
};

// Seed Initial Data
function initApp() {
    if (!DB.get('users')) {
        DB.set('users', [
            { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@medicore.com', username: 'admin', password: 'admin123', role: 'Administrator' }
        ]);
    }

    if (!DB.get('medicines')) {
        DB.set('medicines', [
            { id: 1, name: "Paracetamol 500mg", type: "tablet", price: 55.00, stock: 450, manufacturer: "PharmaCorp Inc.", description: "Paracetamol is a widely used analgesic and antipyretic medication.", usage: "Take 1-2 tablets every 4-6 hours.", whenToUse: "Used for headaches, fever reduction.", sideEffects: "Rare when taken at recommended doses.", precautions: "Do not use with other products containing paracetamol." },
            { id: 2, name: "Amoxicillin 250mg", type: "capsule", price: 120.50, stock: 180, manufacturer: "MediHealth Labs", description: "Amoxicillin is a penicillin antibiotic.", usage: "Take one capsule three times daily.", whenToUse: "Bacterial infections.", sideEffects: "Nausea, diarrhea, rash.", precautions: "Inform doctor of any penicillin allergies." },
            { id: 3, name: "Cough Syrup DX", type: "syrup", price: 85.75, stock: 95, manufacturer: "HealthFirst Pharma", description: "A soothing cough syrup.", usage: "Adults: 10ml every 4-6 hours.", whenToUse: "Dry, hacking coughs.", sideEffects: "Drowsiness, dizziness.", precautions: "Not for children under 6." },
            { id: 4, name: "Insulin Glargine", type: "injection", price: 890.99, stock: 42, manufacturer: "Diabeticare Corp", description: "Long-acting insulin analog.", usage: "Inject subcutaneously once daily.", whenToUse: "Type 1 and Type 2 diabetes.", sideEffects: "Hypoglycemia, weight gain.", precautions: "Monitor blood sugar regularly." },
            { id: 5, name: "Ibuprofen 400mg", type: "tablet", price: 72.49, stock: 380, manufacturer: "PainRelief Pharma", description: "NSAID for pain and inflammation.", usage: "Take 1 tablet every 4-6 hours.", whenToUse: "Headaches, dental pain, muscle aches.", sideEffects: "Stomach upset, heartburn.", precautions: "Avoid if you have stomach ulcers." },
            { id: 6, name: "Vitamin D3 1000IU", type: "tablet", price: 125.00, stock: 520, manufacturer: "NutriWell Labs", description: "Essential vitamin supplement.", usage: "Take one tablet daily with a meal.", whenToUse: "Vitamin D deficiency.", sideEffects: "Generally well tolerated.", precautions: "Consult doctor if you have kidney disease." }
        ]);
    }

    if (!DB.get('sales')) {
        DB.set('sales', []);
    }
}

// ====== STATE ======
let currentPage = 'dashboard';
let currentBillItems = [];
let sidebarOpen = false;
let currentUser = null;

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    checkAuth();
    initAuthPages();
    initDashboard();
});

// ====== AUTHENTICATION ======
function checkAuth() {
    currentUser = DB.get('current_user');
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('dashboard').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'flex';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('dashboard').style.display = 'block';
    updateUserUI();
    renderDashboardData();
    initCharts();
}

function initAuthPages() {
    // Switch views
    document.getElementById('goToSignup').addEventListener('click', (e) => { e.preventDefault(); showSignup(); });
    document.getElementById('goToLogin').addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

    // Login Logic
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const users = DB.get('users');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            DB.set('current_user', user);
            currentUser = user;
            showDashboard();
            notify('Welcome back, ' + user.firstName + '!', 'success');
        } else {
            notify('Invalid username or password.', 'error');
        }
    });

    // Signup Logic
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            notify('Passwords do not match.', 'error');
            return;
        }

        const users = DB.get('users');
        if (users.find(u => u.username === username)) {
            notify('Username already exists.', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            username,
            password, // In a real app, hash this!
            role: 'Pharmacist'
        };

        users.push(newUser);
        DB.set('users', users);
        
        notify('Account created! Please login.', 'success');
        showLogin();
        document.getElementById('loginUsername').value = username;
    });
}

function updateUserUI() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.firstName + ' ' + currentUser.lastName;
        document.getElementById('userRole').textContent = currentUser.role;
        document.getElementById('userAvatar').textContent = currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0);
    }
}

document.getElementById('logoutBtn').addEventListener('click', function() {
    DB.remove('current_user');
    currentUser = null;
    showLogin();
    notify('Logged out successfully.', 'success');
});

// ====== DASHBOARD CORE ======
function initDashboard() {
    initNavigation();
    initTabs();
    initSearch();
    setCurrentDate();
    
    // Add Medicine Form
    document.getElementById('addMedicineForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewMedicine();
    });
}

function renderDashboardData() {
    const medicines = DB.get('medicines');
    const sales = DB.get('sales');

    // Stats
    const totalMeds = medicines.reduce((sum, m) => sum + m.stock, 0);
    const lowStock = medicines.filter(m => m.stock < 50).length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    
    document.getElementById('statTotalMeds').textContent = totalMeds.toLocaleString('en-IN');
    document.getElementById('statLowStock').textContent = lowStock;
    document.getElementById('statTotalSales').textContent = formatter.format(totalRevenue);
    document.getElementById('statTransactions').textContent = sales.length;

    // Recent Transactions
    const tbody = document.getElementById('recentTransactions');
    tbody.innerHTML = sales.slice(-5).reverse().map(s => `
        <tr>
            <td class="font-medium">${s.invoice}</td>
            <td>${s.customer}</td>
            <td>${s.items.length} items</td>
            <td class="font-semibold">${formatter.format(s.total)}</td>
            <td class="text-[var(--muted)]">${s.date}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-[var(--muted)] py-4">No transactions yet</td></tr>';
}

// ====== NAVIGATION ======
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-link[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navigateTo(this.dataset.page);
        });
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', function() {
        sidebarOpen = !sidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', sidebarOpen);
    });
}

function navigateTo(page) {
    currentPage = page;
    
    // Update nav active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Switch pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(page + 'Page');
    if (pageEl) pageEl.classList.add('active');

    // Load specific page data
    if (page === 'inventory') renderInventory();
    if (page === 'billing') initBilling();
    if (page === 'sales') renderSalesPage();

    sidebarOpen = false;
    document.getElementById('sidebar').classList.remove('open');
}

// ====== INVENTORY ======
function renderInventory(filter = 'all') {
    const medicines = DB.get('medicines');
    const container = document.getElementById('medicineGrid');
    const filtered = filter === 'all' ? medicines : medicines.filter(m => m.type === filter);
    
    container.innerHTML = filtered.map(med => {
        const stockStatus = med.stock < 50 ? 'danger' : med.stock < 100 ? 'warning' : 'success';
        const stockLabel = med.stock < 50 ? 'Low Stock' : med.stock < 100 ? 'Limited' : 'In Stock';
        
        return `
            <div class="card cursor-pointer hover:border-emerald-500/30" onclick="showMedicineDetails(${med.id})">
                <div class="flex items-start justify-between mb-4">
                    <div><span class="badge badge-${stockStatus}">${stockLabel}</span></div>
                    <span class="text-[var(--muted)] text-sm capitalize">${med.type}</span>
                </div>
                <h3 class="font-display font-semibold text-lg mb-2">${med.name}</h3>
                <p class="text-[var(--muted)] text-sm mb-4">${med.manufacturer}</p>
                <div class="flex items-center justify-between">
                    <p class="font-display text-xl font-bold text-emerald-400">${formatter.format(med.price)}</p>
                    <p class="text-[var(--muted)]">${med.stock} units</p>
                </div>
            </div>
        `;
    }).join('') || '<p class="text-[var(--muted)] col-span-full text-center py-8">No medicines found.</p>';
}

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderInventory(this.dataset.type);
        });
    });
}

function initSearch() {
    document.getElementById('medicineSearch').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll('#medicineGrid .card');
        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = name.includes(query) ? 'block' : 'none';
        });
    });
}

function showMedicineDetails(id) {
    const med = DB.get('medicines').find(m => m.id === id);
    if (!med) return;

    document.getElementById('modalMedicineName').textContent = med.name;
    document.getElementById('modalMedicineType').textContent = med.manufacturer + ' - ' + med.type.charAt(0).toUpperCase() + med.type.slice(1);
    document.getElementById('modalStock').textContent = med.stock + ' units';
    document.getElementById('modalPrice').textContent = formatter.format(med.price);
    document.getElementById('modalDescription').textContent = med.description;
    document.getElementById('modalUsage').textContent = med.usage;
    document.getElementById('modalWhenToUse').textContent = med.whenToUse;
    document.getElementById('modalSideEffects').textContent = med.sideEffects;
    document.getElementById('modalPrecautions').textContent = med.precautions;

    document.getElementById('medicineModal').classList.add('active');
}

function showAddMedicineModal() {
    document.getElementById('addMedicineModal').classList.add('active');
}

function addNewMedicine() {
    const newMed = {
        id: Date.now(),
        name: document.getElementById('newMedName').value,
        type: document.getElementById('newMedType').value,
        price: parseFloat(document.getElementById('newMedPrice').value),
        stock: parseInt(document.getElementById('newMedStock').value),
        manufacturer: document.getElementById('newMedManufacturer').value,
        description: document.getElementById('newMedDescription').value,
        usage: 'As directed by physician.',
        whenToUse: 'As prescribed.',
        sideEffects: 'Consult your doctor.',
        precautions: 'Keep out of reach of children.'
    };

    const medicines = DB.get('medicines');
    medicines.push(newMed);
    DB.set('medicines', medicines);

    closeModal('addMedicineModal');
    renderInventory();
    renderDashboardData();
    document.getElementById('addMedicineForm').reset();
    notify('Medicine added successfully!', 'success');
}

// ====== BILLING ======
function initBilling() {
    const medicines = DB.get('medicines');
    const select = document.getElementById('medicineSelect');
    select.innerHTML = '<option value="">Select Medicine</option>' + 
        medicines.map(m => `<option value="${m.id}">${m.name} - ${formatter.format(m.price)} (${m.stock} in stock)</option>`).join('');
}

function addToBill() {
    const select = document.getElementById('medicineSelect');
    const quantity = parseInt(document.getElementById('quantity').value);
    const medId = parseInt(select.value);
    
    if (!medId || !quantity || quantity < 1) {
        notify('Please select medicine and valid quantity.', 'error');
        return;
    }
    
    const med = DB.get('medicines').find(m => m.id === medId);
    if (!med) return;

    if (med.stock < quantity) {
        notify('Insufficient stock! Only ' + med.stock + ' available.', 'error');
        return;
    }

    const existingIndex = currentBillItems.findIndex(item => item.id === medId);
    if (existingIndex > -1) {
        currentBillItems[existingIndex].quantity += quantity;
    } else {
        currentBillItems.push({
            id: medId,
            name: med.name,
            price: med.price,
            quantity: quantity
        });
    }

    renderBillItems();
    calculateTotal();
    
    select.value = '';
    document.getElementById('quantity').value = 1;
}

function removeFromBill(id) {
    currentBillItems = currentBillItems.filter(item => item.id !== id);
    renderBillItems();
    calculateTotal();
}

function renderBillItems() {
    const container = document.getElementById('billItems');
    container.innerHTML = currentBillItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${formatter.format(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatter.format(item.price * item.quantity)}</td>
            <td>
                <button onclick="removeFromBill(${item.id})" class="text-red-400 hover:text-red-300 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-[var(--muted)] py-4">No items added</td></tr>';
}

function calculateTotal() {
    const subtotal = currentBillItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = subtotal + tax - discount;

    document.getElementById('subtotal').textContent = formatter.format(subtotal);
    document.getElementById('tax').textContent = formatter.format(tax);
    document.getElementById('grandTotal').textContent = formatter.format(total);
}

function clearBill() {
    currentBillItems = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('discount').value = 0;
    renderBillItems();
    calculateTotal();
}

function generateReceipt() {
    if (currentBillItems.length === 0) {
        notify('Please add items to the bill.', 'error');
        return;
    }

    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const customerPhone = document.getElementById('customerPhone').value || 'N/A';
    
    const subtotal = currentBillItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = subtotal + tax - discount;

    const invoiceNo = 'INV-' + Date.now().toString().slice(-8);
    const date = new Date().toLocaleString();

    // Save Sale
    const sale = {
        invoice: invoiceNo,
        customer: customerName,
        phone: customerPhone,
        items: [...currentBillItems],
        subtotal,
        tax,
        discount,
        total,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    const sales = DB.get('sales');
    sales.push(sale);
    DB.set('sales', sales);

    // Update Inventory
    let medicines = DB.get('medicines');
    currentBillItems.forEach(item => {
        const medIndex = medicines.findIndex(m => m.id === item.id);
        if (medIndex > -1) {
            medicines[medIndex].stock -= item.quantity;
        }
    });
    DB.set('medicines', medicines);

    // Generate QR Data
    const qrData = `Invoice: ${invoiceNo}|Customer: ${customerName}|Total: ${formatter.format(total)}`;

    const receiptHTML = `
        <div class="text-center mb-4">
            <h2 class="text-2xl font-bold text-emerald-600">MediCore Pharmacy</h2>
            <p class="text-gray-600 text-sm">123 Health Street, Medical District</p>
            <p class="text-gray-600 text-sm">Tel: (555) 123-4567</p>
        </div>
        
        <div class="border-t border-b border-gray-200 py-3 my-3">
            <div class="flex justify-between text-sm">
                <span class="font-semibold">Invoice:</span>
                <span>${invoiceNo}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="font-semibold">Date:</span>
                <span>${date}</span>
            </div>
        </div>

        <div class="mb-4">
            <h4 class="font-semibold mb-1 text-gray-700">Customer:</h4>
            <p class="text-sm">${customerName} (${customerPhone})</p>
        </div>

        <div class="border-t border-gray-200 pt-3">
            <table class="w-full text-sm mb-3">
                <thead>
                    <tr class="border-b border-gray-200">
                        <th class="text-left py-2">Item</th>
                        <th class="text-center py-2">Qty</th>
                        <th class="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentBillItems.map(item => `
                      <tr>
                        <td class="py-2">${item.name}</td>
                        <td class="text-center py-2">${item.quantity}</td>
                        <td class="text-right py-2">${formatter.format(item.price * item.quantity)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="border-t border-gray-200 pt-3 space-y-1">
            <div class="flex justify-between text-sm"><span>Subtotal:</span><span>${formatter.format(subtotal)}</span></div>
            <div class="flex justify-between text-sm"><span>Tax (8%):</span><span>${formatter.format(tax)}</span></div>
            ${discount > 0 ? `<div class="flex justify-between text-sm text-red-600"><span>Discount:</span><span>-${formatter.format(discount)}</span></div>` : ''}
            <div class="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total:</span><span>${formatter.format(total)}</span>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 text-center">
            <canvas id="qrCanvas" width="100" height="100"></canvas>
            <p class="text-xs text-gray-500 mt-2">Scan for digital verification</p>
        </div>

        <div class="mt-4 text-center text-xs text-gray-500">
            <p>Thank you for your purchase!</p>
            <p>Get well soon.</p>
        </div>
    `;

    document.getElementById('receiptContent').innerHTML = receiptHTML;
    
    setTimeout(() => generateQRCode('qrCanvas', qrData), 100);

    document.getElementById('receiptModal').classList.add('active');
    
    // Refresh Data
    renderDashboardData();
    clearBill();
    notify('Transaction completed successfully!', 'success');
}

function generateQRCode(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = 'black';
    const cellSize = 4;
    
    // Create pattern based on data hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash = hash & hash;
    }
    
    // Draw position patterns (corners)
    const drawPositionPattern = (x, y) => {
        ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = 'white';
        ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    };
    
    const padding = 10;
    drawPositionPattern(padding, padding);
    drawPositionPattern(size - padding - 7 * cellSize, padding);
    drawPositionPattern(padding, size - padding - 7 * cellSize);
    
    // Draw data area
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (Math.random() > 0.5 + (hash % 10) / 100) {
                const x = padding + 8 * cellSize + i * cellSize;
                const y = padding + 8 * cellSize + j * cellSize;
                if (x < size - padding - cellSize && y < size - padding - cellSize) {
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    }
}

function printReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Receipt - MediCore Pharmacy</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 12px; color: #333; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 4px; text-align: left; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ====== SALES PAGE ======
function renderSalesPage() {
    const sales = DB.get('sales');
    
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = sales.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = [...new Set(sales.map(s => s.customer))].length;

    document.getElementById('revenueTotal').textContent = formatter.format(totalRevenue);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('avgOrder').textContent = formatter.format(avgOrder);
    document.getElementById('uniqueCustomers').textContent = uniqueCustomers;

    const tbody = document.getElementById('salesHistory');
    tbody.innerHTML = sales.slice().reverse().map(s => `
        <tr>
            <td>${s.date}</td>
            <td class="font-medium">${s.invoice}</td>
            <td>${s.customer}</td>
            <td>${s.items.length} items</td>
            <td class="font-semibold">${formatter.format(s.total)}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-[var(--muted)] py-4">No sales recorded</td></tr>';
}

// ====== CHARTS ======
function initCharts() {
    // Sales Chart
    const salesCanvas = document.getElementById('salesChart');
    if (salesCanvas) {
        const ctx = salesCanvas.getContext('2d');
        const rect = salesCanvas.parentElement.getBoundingClientRect();
        salesCanvas.width = rect.width;
        salesCanvas.height = 300;
        
        const sales = DB.get('sales');
        // Mock trend data for visual
        const data = [1200, 1900, 1500, 2200, 1800, 2500, sales.reduce((s, i) => s + i.total, 0) / 5];
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        drawLineChart(ctx, salesCanvas.width, salesCanvas.height, data, labels, '#10b981');
    }

    // Category Chart
    const catCanvas = document.getElementById('categoryChart');
    if (catCanvas) {
        const ctx = catCanvas.getContext('2d');
        const rect = catCanvas.parentElement.getBoundingClientRect();
        catCanvas.width = rect.width;
        catCanvas.height = 300;
        
        const medicines = DB.get('medicines');
        const types = { tablet: 0, syrup: 0, capsule: 0, injection: 0 };
        medicines.forEach(m => types[m.type] = (types[m.type] || 0) + m.stock);
        
        const data = Object.values(types);
        const labels = Object.keys(types).map(t => t.charAt(0).toUpperCase() + t.slice(1));
        const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];
        
        drawPieChart(ctx, catCanvas.width, catCanvas.height, data, labels, colors);
    }
}

function drawLineChart(ctx, width, height, data, labels, color) {
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxVal = Math.max(...data) * 1.2;
    const stepX = chartWidth / (data.length - 1);
    const stepY = chartHeight / maxVal;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - val * stepY;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - val * stepY;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    ctx.fillStyle = color;
    data.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = height - padding - val * stepY;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    });

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px DM Sans';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
        ctx.fillText(label, padding + i * stepX, height - 20);
    });
}

function drawPieChart(ctx, width, height, data, labels, colors) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    const total = data.reduce((a, b) => a + b, 0);
    
    ctx.clearRect(0, 0, width, height);
    
    let currentAngle = -Math.PI / 2;

    data.forEach((val, i) => {
        if (val === 0) return;
        const sliceAngle = (val / total) * Math.PI * 2;
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        // Label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '11px DM Sans';
        ctx.textAlign = 'center';
        ctx.fillText(`${labels[i]}`, labelX, labelY);

        currentAngle += sliceAngle;
    });

    // Center hole
    ctx.fillStyle = '#111820';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

// ====== UTILITIES ======
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);
}

function notify(message, type = 'success') {
    const el = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    el.className = 'notification show ' + type;
    setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// Close modals on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
});

// Handle resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initCharts, 250);
});
