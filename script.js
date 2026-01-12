console.log('📊 Script.js v6 - Добавлена аналитика закупок!');

// Глобальные переменные
let dealsData = [];
let paymentsData = [];
let debtsData = [];
let supplierPaymentsData = [];
let purchasesData = [];
let buyerPaymentsData = [];
let monthlyChart = null;
let basisChart = null;
let geographyChart = null;
let paymentsChart = null;
let purchasesChart = null;

// Цветовые палитры
const chartColors = {
    primary: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'],
    accent: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'],
    mixed: ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
};

// Переход к контенту
function scrollToContent() {
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
}

// Создание частиц
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
        `;
        container.appendChild(particle);
    }
}

// Загрузка данных
async function loadData() {
    try {
        console.log('Начинаю загрузку данных...');
        const response = await fetch('data.json');
        const allData = await response.json();
        
        // Загрузка данных о платежах покупателей
        const paymentsResponse = await fetch('payments_2026-01-12.json');
        buyerPaymentsData = await paymentsResponse.json();
        console.log(`Загружено ${buyerPaymentsData.length} записей о платежах покупателей`);
        
        // Распаковываем данные
        const deals = allData.deals || [];
        paymentsData = allData.payments || [];
        debtsData = allData.debts || [];
        supplierPaymentsData = allData.supplier_payments || [];
        const purchases = allData.purchases || [];
        
        // Фильтруем только сделки 2025 года
        dealsData = deals.filter(deal => {
            const confirmDate = deal['Дата подтверждения сделки'];
            if (!confirmDate) return false;
            const year = new Date(confirmDate).getFullYear();
            return year === 2025;
        });
        
        // Фильтруем закупки 2025 года
        purchasesData = purchases.filter(purchase => {
            const regDate = purchase['Дата регистрации сделки с поставщиком'];
            if (!regDate) return false;
            const year = new Date(regDate).getFullYear();
            return year === 2025;
        });
        
        console.log(`Загружено: ${dealsData.length} сделок, ${purchasesData.length} закупок, ${paymentsData.length} платежей, ${debtsData.length} долгов`);
        
        // Инициализация всех секций
        displayHeroStats();
        displayFinanceDashboard();
        displayMonthlyChart();
        displayPaymentsChart();
        displayTopClients();
        displayTopProducts();
        displayPurchasesAnalytics();
        displayBuyerPaymentsAnalytics();
        displayAvgPrices();
        displayBasisChart();
        displayGeographyChart();
        displayRecordDeal();
        displayDebtsStatus();
        displayFinalStats();
        
        initScrollAnimations();
        createParticles();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

// Анимация чисел
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        element.textContent = current.toLocaleString('ru-RU');
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };
    requestAnimationFrame(update);
}

// Hero статистика
function displayHeroStats() {
    const totalDeals = dealsData.length;
    const totalVolume = dealsData.reduce((sum, deal) => sum + (parseFloat(deal['Объем продажи']) || 0), 0);
    const totalRevenue = dealsData.reduce((sum, deal) => sum + (parseFloat(deal['Сумма, тыс. CNY']) || 0), 0);
    
    const dealsEl = document.getElementById('totalDeals');
    const volumeEl = document.getElementById('totalVolume');
    const revenueEl = document.getElementById('totalRevenue');
    
    if (dealsEl) animateValue(dealsEl, 0, totalDeals, 2000);
    if (volumeEl) animateValue(volumeEl, 0, Math.round(totalVolume), 2000);
    if (revenueEl) {
        animateValue(revenueEl, 0, Math.round(totalRevenue), 2000);
    }
}

// График по месяцам с двумя осями
function displayMonthlyChart() {
    const monthlyData = {};
    
    dealsData.forEach(deal => {
        const date = deal['Дата подтверждения сделки'];
        if (!date) return;
        
        const month = new Date(date).toLocaleString('ru-RU', { month: 'long' });
        const volume = parseFloat(deal['Объем продажи']) || 0;
        
        if (!monthlyData[month]) {
            monthlyData[month] = { volume: 0, deals: 0 };
        }
        monthlyData[month].volume += volume;
        monthlyData[month].deals += 1;
    });
    
    const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 
                    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    
    const labels = months.filter(m => monthlyData[m]);
    const volumeValues = labels.map(m => Math.round(monthlyData[m].volume));
    const dealsValues = labels.map(m => monthlyData[m].deals);
    
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    if (monthlyChart) monthlyChart.destroy();
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [
                {
                    label: 'Объем, тонн',
                    data: volumeValues,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    borderRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'Количество сделок',
                    data: dealsValues,
                    type: 'line',
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#ec4899',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 16,
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return 'Объем: ' + context.parsed.y.toLocaleString('ru-RU') + ' тонн';
                            }
                            return 'Сделок: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 12 },
                        callback: (value) => value.toLocaleString('ru-RU')
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    ticks: {
                        color: '#ec4899',
                        font: { size: 12 }
                    },
                    grid: { display: false }
                },
                x: {
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 12 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// Топ агенты
function displayTopClients() {
    const clientsData = {};
    
    dealsData.forEach(deal => {
        const client = deal['Агент\n(Знаменский)'] || 'Не указан';
        const volume = parseFloat(deal['Объем продажи']) || 0;
        const revenue = parseFloat(deal['Сумма, тыс. CNY']) || 0;
        
        if (!clientsData[client]) {
            clientsData[client] = { volume: 0, revenue: 0, deals: 0 };
        }
        clientsData[client].volume += volume;
        clientsData[client].revenue += revenue;
        clientsData[client].deals += 1;
    });
    
    const topClients = Object.entries(clientsData)
        .sort((a, b) => b[1].volume - a[1].volume)
        .slice(0, 5);
    
    const container = document.getElementById('topClients');
    container.innerHTML = topClients.map(([name, data], index) => `
        <div class="top-item">
            <div class="top-rank">#${index + 1}</div>
            <div class="top-info">
                <div class="top-name">${name.trim()}</div>
                <div class="top-details">${data.deals} сделок • ${Math.round(data.revenue).toLocaleString('ru-RU')} тыс. CNY</div>
            </div>
            <div class="top-value">${Math.round(data.volume).toLocaleString('ru-RU')} т</div>
        </div>
    `).join('');
}

// Топ продукты
function displayTopProducts() {
    const productsData = {};
    
    dealsData.forEach(deal => {
        const product = deal['Продукт'] || 'Не указан';
        const volume = parseFloat(deal['Объем продажи']) || 0;
        
        if (!productsData[product]) {
            productsData[product] = { volume: 0, deals: 0 };
        }
        productsData[product].volume += volume;
        productsData[product].deals += 1;
    });
    
    const topProducts = Object.entries(productsData)
        .sort((a, b) => b[1].volume - a[1].volume)
        .slice(0, 5);
    
    const container = document.getElementById('topProducts');
    container.innerHTML = topProducts.map(([name, data], index) => `
        <div class="top-item">
            <div class="top-rank">#${index + 1}</div>
            <div class="top-info">
                <div class="top-name">${name}</div>
                <div class="top-details">${data.deals} сделок</div>
            </div>
            <div class="top-value">${Math.round(data.volume).toLocaleString('ru-RU')} т</div>
        </div>
    `).join('');
}

// Средняя цена продажи
function displayAvgPrices() {
    const productPrices = {};
    
    dealsData.forEach(deal => {
        const product = deal['Продукт'] || 'Не указан';
        const price = parseFloat(deal['Цена продажи, тыс. CNY']) || 0;
        const volume = parseFloat(deal['Объем продажи']) || 0;
        
        if (!productPrices[product]) {
            productPrices[product] = { totalValue: 0, totalVolume: 0 };
        }
        productPrices[product].totalValue += price * volume;
        productPrices[product].totalVolume += volume;
    });
    
    const avgPrices = Object.entries(productPrices)
        .map(([product, data]) => ({
            product,
            avgPrice: data.totalVolume > 0 ? (data.totalValue / data.totalVolume) : 0,
            volume: data.totalVolume
        }))
        .filter(p => p.avgPrice > 0)
        .sort((a, b) => b.volume - a.volume);
    
    const container = document.getElementById('avgPrices');
    container.innerHTML = avgPrices.map(item => `
        <div class="stat-card">
            <div class="stat-card-icon">💹</div>
            <div class="stat-card-title">${item.product}</div>
            <div class="stat-card-value">${item.avgPrice.toFixed(3)}</div>
            <div class="stat-card-subtitle">тыс. CNY/тонна • ${Math.round(item.volume).toLocaleString('ru-RU')} т</div>
        </div>
    `).join('');
}

// Пончиковая диаграмма - Базисы
function displayBasisChart() {
    const basisData = {};
    
    dealsData.forEach(deal => {
        const basis = deal['Базис'] || 'Не указан';
        const volume = parseFloat(deal['Объем продажи']) || 0;
        
        if (!basisData[basis]) {
            basisData[basis] = { volume: 0, deals: 0 };
        }
        basisData[basis].volume += volume;
        basisData[basis].deals += 1;
    });
    
    const sortedBasis = Object.entries(basisData)
        .sort((a, b) => b[1].volume - a[1].volume);
    
    const totalVolume = sortedBasis.reduce((sum, [, data]) => sum + data.volume, 0);
    
    const labels = sortedBasis.map(([name]) => name);
    const values = sortedBasis.map(([, data]) => Math.round(data.volume));
    const colors = chartColors.mixed.slice(0, sortedBasis.length);
    
    const ctx = document.getElementById('basisChart').getContext('2d');
    
    if (basisChart) basisChart.destroy();
    
    basisChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#111827',
                borderWidth: 4,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 16,
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            const percent = ((context.parsed / totalVolume) * 100).toFixed(1);
                            return `${context.parsed.toLocaleString('ru-RU')} т (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Легенда
    const legendContainer = document.getElementById('basisLegend');
    legendContainer.innerHTML = sortedBasis.map(([basis, data], i) => {
        const percent = ((data.volume / totalVolume) * 100).toFixed(1);
        return `
            <div class="legend-row">
                <div class="legend-dot" style="background: ${colors[i]}"></div>
                <div class="legend-info">
                    <div class="legend-name">${basis}</div>
                    <div class="legend-stats">${data.deals} сделок • ${Math.round(data.volume).toLocaleString('ru-RU')} т</div>
                </div>
                <div class="legend-percent">${percent}%</div>
            </div>
        `;
    }).join('');
}

// Пончиковая диаграмма - География
function displayGeographyChart() {
    const regionData = {};
    
    dealsData.forEach(deal => {
        const region = deal['Регион закупки'] || 'Не указан';
        const volume = parseFloat(deal['Объем продажи']) || 0;
        
        if (!regionData[region]) {
            regionData[region] = { volume: 0, deals: 0 };
        }
        regionData[region].volume += volume;
        regionData[region].deals += 1;
    });
    
    const sortedRegions = Object.entries(regionData)
        .sort((a, b) => b[1].volume - a[1].volume);
    
    const totalVolume = sortedRegions.reduce((sum, [, data]) => sum + data.volume, 0);
    
    const regionIcons = {
        'ЮГ': '🌴',
        'ЦЕНТР': '🏛️',
        'СИБИРЬ': '❄️',
        'default': '📍'
    };
    
    const labels = sortedRegions.map(([name]) => name);
    const values = sortedRegions.map(([, data]) => Math.round(data.volume));
    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];
    
    const ctx = document.getElementById('geographyChart').getContext('2d');
    
    if (geographyChart) geographyChart.destroy();
    
    geographyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, sortedRegions.length),
                borderColor: '#111827',
                borderWidth: 4,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 16,
                    borderColor: '#10b981',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            const percent = ((context.parsed / totalVolume) * 100).toFixed(1);
                            return `${context.parsed.toLocaleString('ru-RU')} т (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Легенда
    const legendContainer = document.getElementById('geographyLegend');
    legendContainer.innerHTML = sortedRegions.map(([region, data], i) => {
        const percent = ((data.volume / totalVolume) * 100).toFixed(1);
        const icon = regionIcons[region.toUpperCase()] || regionIcons['default'];
        return `
            <div class="legend-row">
                <div class="legend-dot" style="background: ${colors[i]}"></div>
                <div class="legend-info">
                    <div class="legend-name">${icon} ${region}</div>
                    <div class="legend-stats">${data.deals} сделок • ${Math.round(data.volume).toLocaleString('ru-RU')} т</div>
                </div>
                <div class="legend-percent">${percent}%</div>
            </div>
        `;
    }).join('');
}

// Рекордная сделка
function displayRecordDeal() {
    const recordByVolume = dealsData.reduce((max, deal) => {
        const volume = parseFloat(deal['Объем продажи']) || 0;
        return volume > (parseFloat(max['Объем продажи']) || 0) ? deal : max;
    }, dealsData[0]);
    
    const recordByRevenue = dealsData.reduce((max, deal) => {
        const revenue = parseFloat(deal['Сумма, тыс. CNY']) || 0;
        return revenue > (parseFloat(max['Сумма, тыс. CNY']) || 0) ? deal : max;
    }, dealsData[0]);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Не указана';
        return new Date(dateStr).toLocaleDateString('ru-RU', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    };
    
    const container = document.getElementById('recordDeal');
    container.innerHTML = `
        <div class="record-grid">
            <div class="record-item">
                <div class="record-badge">🥇 РЕКОРД ПО ОБЪЁМУ</div>
                <div class="record-main">
                    <div class="record-value">${Math.round(parseFloat(recordByVolume['Объем продажи'])).toLocaleString('ru-RU')} т</div>
                    <div class="record-product">${recordByVolume['Продукт']}</div>
                </div>
                <div class="record-details">
                    <div class="record-detail">
                        <span class="record-label">Покупатель</span>
                        <span class="record-text">${recordByVolume['Покупатель']}</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Сумма сделки</span>
                        <span class="record-text">${Math.round(parseFloat(recordByVolume['Сумма, тыс. CNY'])).toLocaleString('ru-RU')} тыс. CNY</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Дата</span>
                        <span class="record-text">${formatDate(recordByVolume['Дата подтверждения сделки'])}</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Базис</span>
                        <span class="record-text">${recordByVolume['Базис']}</span>
                    </div>
                </div>
            </div>
            <div class="record-item">
                <div class="record-badge revenue-badge">💎 РЕКОРД ПО СУММА</div>
                <div class="record-main">
                    <div class="record-value">${Math.round(parseFloat(recordByRevenue['Сумма, тыс. CNY'])).toLocaleString('ru-RU')} тыс.</div>
                    <div class="record-product">${recordByRevenue['Продукт']}</div>
                </div>
                <div class="record-details">
                    <div class="record-detail">
                        <span class="record-label">Покупатель</span>
                        <span class="record-text">${recordByRevenue['Покупатель']}</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Объём</span>
                        <span class="record-text">${Math.round(parseFloat(recordByRevenue['Объем продажи'])).toLocaleString('ru-RU')} т</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Дата</span>
                        <span class="record-text">${formatDate(recordByRevenue['Дата подтверждения сделки'])}</span>
                    </div>
                    <div class="record-detail">
                        <span class="record-label">Базис</span>
                        <span class="record-text">${recordByRevenue['Базис']}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Timeline
function displayTimeline() {
    const monthlyData = {};
    
    dealsData.forEach(deal => {
        const date = deal['Дата подтверждения сделки'];
        if (!date) return;
        
        const dateObj = new Date(date);
        const monthKey = dateObj.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        const volume = parseFloat(deal['Объем продажи']) || 0;
        const revenue = parseFloat(deal['Сумма, тыс. CNY']) || 0;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { volume: 0, revenue: 0, deals: 0, date: dateObj };
        }
        monthlyData[monthKey].volume += volume;
        monthlyData[monthKey].revenue += revenue;
        monthlyData[monthKey].deals += 1;
    });
    
    const sortedMonths = Object.entries(monthlyData)
        .sort((a, b) => a[1].date - b[1].date);
    
    const container = document.getElementById('timeline');
    container.innerHTML = sortedMonths.map(([month, data]) => `
        <div class="timeline-item">
            <div class="timeline-month">${month.charAt(0).toUpperCase() + month.slice(1)}</div>
            <div class="timeline-stats">
                <div class="timeline-stat">
                    <div class="timeline-stat-label">Сделок</div>
                    <div class="timeline-stat-value">${data.deals}</div>
                </div>
                <div class="timeline-stat">
                    <div class="timeline-stat-label">Объем</div>
                    <div class="timeline-stat-value">${Math.round(data.volume).toLocaleString('ru-RU')} т</div>
                </div>
                <div class="timeline-stat">
                    <div class="timeline-stat-label">Выручка</div>
                    <div class="timeline-stat-value">${Math.round(data.revenue).toLocaleString('ru-RU')}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Финансовый дашборд
function displayFinanceDashboard() {
    // Считаем поступления (оплаченные) - данные в CNY, делим на 1000
    const totalReceived = paymentsData.reduce((sum, payment) => {
        const amount = parseFloat(payment['Сумма поступления в cny\n(Самойленко)']) || 0;
        return sum + amount / 1000;
    }, 0);
    
    // Считаем ожидаемые поступления (не оплачено) - данные в CNY, делим на 1000
    const totalPending = paymentsData.reduce((sum, payment) => {
        if (payment['Статус оплаты'] === 'не оплачено') {
            const amount = parseFloat(payment['Выставленная сумма оплаты покупателем, CNY\n(Самойленко)']) || 0;
            return sum + amount / 1000;
        }
        return sum;
    }, 0);
    
    // Считаем долги - данные в CNY, делим на 1000
    const totalDebts = debtsData.reduce((sum, debt) => {
        return sum + (parseFloat(debt['Размер в CNY']) || 0) / 1000;
    }, 0);
    
    const resolvedDebts = debtsData.filter(d => d['Статус'] === 'Выполнен').length;
    const activeDebts = debtsData.filter(d => d['Статус'] !== 'Выполнен').length;
    
    const container = document.getElementById('financeDashboard');
    if (!container) return;
    
    container.innerHTML = `
        <div class="finance-grid">
            <div class="finance-card received">
                <div class="finance-icon">💵</div>
                <div class="finance-value">${Math.round(totalReceived).toLocaleString('ru-RU')}</div>
                <div class="finance-label">Получено, тыс. CNY</div>
            </div>
        </div>
    `;
}

// График поступлений по месяцам
function displayPaymentsChart() {
    const monthlyPayments = {};
    
    paymentsData.forEach(payment => {
        const dateStr = payment['Дата прихода\n(Самойленко)'];
        if (!dateStr) return;
        
        const date = new Date(dateStr);
        const month = date.toLocaleString('ru-RU', { month: 'long' });
        const amount = parseFloat(payment['Сумма поступления в cny\n(Самойленко)']) || 0;
        
        if (!monthlyPayments[month]) {
            monthlyPayments[month] = 0;
        }
        monthlyPayments[month] += amount / 1000; // Данные в CNY, делим на 1000
    });
    
    const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 
                    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    
    const labels = months.filter(m => monthlyPayments[m]);
    const values = labels.map(m => Math.round(monthlyPayments[m]));
    
    const ctx = document.getElementById('paymentsChart');
    if (!ctx) return;
    
    if (paymentsChart) paymentsChart.destroy();
    
    paymentsChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Поступления, тыс. CNY',
                data: values,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 16,
                    borderColor: '#10b981',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => context.parsed.y.toLocaleString('ru-RU') + ' тыс. CNY'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9ca3af',
                        callback: (value) => value.toLocaleString('ru-RU')
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            }
        }
    });
}

// Статус долгов
function displayDebtsStatus() {
    const debtsByInitiator = {};
    
    debtsData.forEach(debt => {
        const initiator = debt['Инициатор претензии'] || 'Не указан';
        const agent = debt['Агент'] || 'Не указан';
        const type = debt['Тип претензии'] || 'Не указан';
        const amount = parseFloat(debt['Размер в CNY']) || 0;
        const status = debt['Статус'];
        
        if (!debtsByInitiator[initiator]) {
            debtsByInitiator[initiator] = {};
        }
        if (!debtsByInitiator[initiator][agent]) {
            debtsByInitiator[initiator][agent] = {};
        }
        if (!debtsByInitiator[initiator][agent][type]) {
            debtsByInitiator[initiator][agent][type] = { total: 0, resolved: 0, active: 0 };
        }
        debtsByInitiator[initiator][agent][type].total += amount / 1000; // Данные в CNY, делим на 1000
        if (status === 'Выполнен') {
            debtsByInitiator[initiator][agent][type].resolved++;
        } else {
            debtsByInitiator[initiator][agent][type].active++;
        }
    });
    
    const container = document.getElementById('debtsStatus');
    if (!container) return;
    
    const html = Object.entries(debtsByInitiator)
        .sort((a, b) => {
            const totalA = Object.values(a[1]).reduce((sum, agents) => {
                return sum + Object.values(agents).reduce((agentSum, types) => {
                    return agentSum + Object.values(types).reduce((typeSum, data) => typeSum + data.total, 0);
                }, 0);
            }, 0);
            const totalB = Object.values(b[1]).reduce((sum, agents) => {
                return sum + Object.values(agents).reduce((agentSum, types) => {
                    return agentSum + Object.values(types).reduce((typeSum, data) => typeSum + data.total, 0);
                }, 0);
            }, 0);
            return totalB - totalA;
        })
        .map(([initiator, agents], initiatorIndex) => {
            const initiatorTotal = Object.values(agents).reduce((sum, agentTypes) => {
                return sum + Object.values(agentTypes).reduce((typeSum, data) => typeSum + data.total, 0);
            }, 0);
            
            return `
            <div class="debt-group">
                <div class="debt-initiator-header" onclick="toggleDebtGroup('initiator-${initiatorIndex}')">
                    <div class="debt-initiator-title">
                        <span class="toggle-icon" id="icon-initiator-${initiatorIndex}">▼</span>
                        ${initiator}
                    </div>
                    <div class="debt-total">${Math.round(initiatorTotal).toLocaleString('ru-RU')} тыс. CNY</div>
                </div>
                <div class="debt-initiator-content" id="initiator-${initiatorIndex}">
                    ${Object.entries(agents)
                        .sort((a, b) => {
                            const totalA = Object.values(a[1]).reduce((sum, typeData) => sum + typeData.total, 0);
                            const totalB = Object.values(b[1]).reduce((sum, typeData) => sum + typeData.total, 0);
                            return totalB - totalA;
                        })
                        .map(([agent, types], agentIndex) => {
                            const agentTotal = Object.values(types).reduce((sum, data) => sum + data.total, 0);
                            const agentId = `agent-${initiatorIndex}-${agentIndex}`;
                            
                            return `
                            <div class="debt-agent-group">
                                <div class="debt-agent-header" onclick="toggleDebtGroup('${agentId}')">
                                    <div class="debt-agent-title">
                                        <span class="toggle-icon" id="icon-${agentId}">▼</span>
                                        ${agent}
                                    </div>
                                    <div class="debt-agent-total">${Math.round(agentTotal).toLocaleString('ru-RU')} тыс. CNY</div>
                                </div>
                                <div class="debt-agent-content" id="${agentId}">
                                    ${Object.entries(types)
                                        .sort((a, b) => b[1].total - a[1].total)
                                        .map(([type, data]) => `
                                            <div class="debt-item">
                                                <div class="debt-header">
                                                    <div class="debt-type">${type}</div>
                                                    <div class="debt-amount">${Math.round(data.total).toLocaleString('ru-RU')} тыс. CNY</div>
                                                </div>
                                                <div class="debt-status">
                                                    <span class="debt-badge resolved">✓ ${data.resolved} решено</span>
                                                    ${data.active > 0 ? `<span class="debt-badge active">⚡ ${data.active} в работе</span>` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        `}).join('')}
                </div>
            </div>
        `}).join('');
    
    container.innerHTML = html;
}

// Переключение видимости групп долгов
function toggleDebtGroup(id) {
    const content = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

// Финальная статистика
function displayFinalStats() {
    const totalDeals = dealsData.length;
    const totalVolume = dealsData.reduce((sum, deal) => sum + (parseFloat(deal['Объем продажи']) || 0), 0);
    const uniqueClients = new Set(dealsData.map(d => d['Покупатель'])).size;
    
    const finalDeals = document.getElementById('finalDeals');
    const finalVolume = document.getElementById('finalVolume');
    const finalClients = document.getElementById('finalClients');
    
    if (finalDeals) finalDeals.textContent = totalDeals;
    if (finalVolume) finalVolume.textContent = Math.round(totalVolume).toLocaleString('ru-RU');
    if (finalClients) finalClients.textContent = uniqueClients;
}

// Scroll анимации
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });
    
    sections.forEach(section => observer.observe(section));
}

// Аналитика закупок
function displayPurchasesAnalytics() {
    if (!purchasesData || purchasesData.length === 0) return;
    
    // 1. Топ поставщиков по объему
    const supplierVolumes = {};
    const supplierSpending = {};
    
    purchasesData.forEach(purchase => {
        const supplier = purchase['Поставщик'] || 'Неизвестно';
        const volume = parseFloat(purchase['Объем контрактации, тонн']) || 0;
        const price = parseFloat(purchase['Цена закупки, т.р./тонн']) || 0;
        const spending = volume * price;
        
        supplierVolumes[supplier] = (supplierVolumes[supplier] || 0) + volume;
        supplierSpending[supplier] = (supplierSpending[supplier] || 0) + spending;
    });
    
    const topSuppliers = Object.entries(supplierVolumes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // 2. Средняя цена по продуктам
    const productPrices = {};
    const productCounts = {};
    
    purchasesData.forEach(purchase => {
        const product = purchase['Продукт'] || 'Неизвестно';
        const price = parseFloat(purchase['Цена закупки, т.р./тонн']) || 0;
        
        if (price > 0) {
            productPrices[product] = (productPrices[product] || 0) + price;
            productCounts[product] = (productCounts[product] || 0) + 1;
        }
    });
    
    const avgPricesByProduct = Object.entries(productPrices).map(([product, totalPrice]) => ({
        product,
        avgPrice: totalPrice / productCounts[product]
    })).sort((a, b) => b.avgPrice - a.avgPrice);
    
    // 3. Топ регионов по объему закупок
    const regionVolumes = {};
    
    purchasesData.forEach(purchase => {
        const region = purchase['Регион'] || 'Неизвестно';
        const volume = parseFloat(purchase['Объем контрактации, тонн']) || 0;
        
        regionVolumes[region] = (regionVolumes[region] || 0) + volume;
    });
    
    const topRegions = Object.entries(regionVolumes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Общая статистика
    const totalPurchaseVolume = purchasesData.reduce((sum, p) => sum + (parseFloat(p['Объем контрактации, тонн']) || 0), 0);
    const totalPurchaseSpending = purchasesData.reduce((sum, p) => {
        const volume = parseFloat(p['Объем контрактации, тонн']) || 0;
        const price = parseFloat(p['Цена закупки, т.р./тонн']) || 0;
        return sum + (volume * price / 1000); // в тыс. руб
    }, 0);
    const uniqueSuppliers = new Set(purchasesData.map(p => p['Поставщик'])).size;
    
    // Отображение
    const container = document.getElementById('purchasesAnalytics');
    if (!container) return;
    
    container.innerHTML = `
        <div class="purchases-stats">
            <div class="purchase-stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-value">${Math.round(totalPurchaseVolume).toLocaleString('ru-RU')}</div>
                <div class="stat-label">Тонн закуплено</div>
            </div>
            <div class="purchase-stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${Math.round(totalPurchaseSpending).toLocaleString('ru-RU')}</div>
                <div class="stat-label">Млн руб затрачено</div>
            </div>
            <div class="purchase-stat-card">
                <div class="stat-icon">🏢</div>
                <div class="stat-value">${uniqueSuppliers}</div>
                <div class="stat-label">Поставщиков</div>
            </div>
            <div class="purchase-stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-value">${purchasesData.length}</div>
                <div class="stat-label">Закупок</div>
            </div>
        </div>
        
        <div class="purchases-content">
            <div class="purchases-section">
                <h3 class="purchases-subtitle">🏆 Топ 5 поставщиков по объему</h3>
                <div class="suppliers-list">
                    ${topSuppliers.map(([supplier, volume], index) => `
                        <div class="supplier-item">
                            <div class="supplier-rank">#${index + 1}</div>
                            <div class="supplier-info">
                                <div class="supplier-name">${supplier}</div>
                                <div class="supplier-details">
                                    <span class="detail-badge">📦 ${Math.round(volume).toLocaleString('ru-RU')} тонн</span>
                                    <span class="detail-badge">💵 ${Math.round(supplierSpending[supplier] / 1000).toLocaleString('ru-RU')} млн ₽</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="purchases-section">
                <h3 class="purchases-subtitle">📊 Средние цены закупки</h3>
                <div class="prices-list">
                    ${avgPricesByProduct.map(({product, avgPrice}) => `
                        <div class="price-item">
                            <div class="price-product">${product}</div>
                            <div class="price-value">${Math.round(avgPrice).toLocaleString('ru-RU')} ₽/т</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="purchases-section">
                <h3 class="purchases-subtitle">🗺️ Топ регионов закупок</h3>
                <div class="regions-list">
                    ${topRegions.map(([region, volume], index) => `
                        <div class="region-item">
                            <div class="region-rank">#${index + 1}</div>
                            <div class="region-name">${region}</div>
                            <div class="region-volume">${Math.round(volume).toLocaleString('ru-RU')} т</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Аналитика платежей покупателей
function displayBuyerPaymentsAnalytics() {
    if (!buyerPaymentsData || buyerPaymentsData.length === 0) return;
    
    const container = document.getElementById('paymentsAnalytics');
    if (!container) return;
    
    // 1. Статистика по покупателям
    const buyerStats = {};
    
    buyerPaymentsData.forEach(payment => {
        const buyer = payment['Покупатель'] || 'Неизвестно';
        const sendDate = payment['Факт дата отправки документов для оплаты'];
        const receiveDate = payment['Дата прихода\n(Самойленко)'];
        const amount = parseFloat(payment['Выставленная сумма оплаты покупателем, CNY\n(Самойленко)']) || 0;
        const status = payment['Статус оплаты'] || 'не оплачено';
        
        if (!buyerStats[buyer]) {
            buyerStats[buyer] = {
                totalPayments: 0,
                paidPayments: 0,
                totalAmount: 0,
                paidAmount: 0,
                paymentDays: [],
                totalDays: 0
            };
        }
        
        buyerStats[buyer].totalPayments++;
        buyerStats[buyer].totalAmount += amount;
        
        if (status !== 'не оплачено' && sendDate && receiveDate) {
            const send = new Date(sendDate);
            const receive = new Date(receiveDate);
            const days = Math.round((receive - send) / (1000 * 60 * 60 * 24));
            
            if (days >= 0 && days < 365) {
                buyerStats[buyer].paymentDays.push(days);
                buyerStats[buyer].paidPayments++;
                buyerStats[buyer].paidAmount += amount;
            }
        }
    });
    
    // Вычисляем средний срок оплаты для каждого покупателя
    Object.values(buyerStats).forEach(stats => {
        if (stats.paymentDays.length > 0) {
            stats.avgPaymentDays = stats.paymentDays.reduce((a, b) => a + b, 0) / stats.paymentDays.length;
        } else {
            stats.avgPaymentDays = null;
        }
    });
    
    // Топ покупателей по количеству платежей
    const topBuyersByCount = Object.entries(buyerStats)
        .sort((a, b) => b[1].totalPayments - a[1].totalPayments)
        .slice(0, 10);
    
    // Топ покупателей по сумме
    const topBuyersByAmount = Object.entries(buyerStats)
        .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
        .slice(0, 10);
    
    // 2. Статистика по типам платежей
    const paymentTypes = {};
    
    buyerPaymentsData.forEach(payment => {
        let type = payment['Аккредитив/ Аванс\n(Самойленко)'] || 'не указано';
        type = type.toLowerCase().trim();
        
        // Нормализация типов
        if (type.includes('аванс')) {
            type = 'аванс';
        } else if (type.includes('аккредитив')) {
            type = 'аккредитив';
        } else if (type.includes('cad') || type.includes('кад')) {
            type = 'CAD';
        } else if (type.includes('платеж против документов')) {
            type = 'платеж против документов';
        } else if (type === '' || type === 'не указано') {
            type = 'не указано';
        }
        
        const amount = parseFloat(payment['Выставленная сумма оплаты покупателем, CNY\n(Самойленко)']) || 0;
        const sendDate = payment['Факт дата отправки документов для оплаты'];
        const receiveDate = payment['Дата прихода\n(Самойленко)'];
        
        if (!paymentTypes[type]) {
            paymentTypes[type] = {
                count: 0,
                totalAmount: 0,
                paidCount: 0,
                paidAmount: 0,
                paymentDays: []
            };
        }
        
        paymentTypes[type].count++;
        paymentTypes[type].totalAmount += amount;
        
        if (sendDate && receiveDate) {
            const send = new Date(sendDate);
            const receive = new Date(receiveDate);
            const days = Math.round((receive - send) / (1000 * 60 * 60 * 24));
            
            if (days >= 0 && days < 365) {
                paymentTypes[type].paymentDays.push(days);
                paymentTypes[type].paidCount++;
                paymentTypes[type].paidAmount += amount;
            }
        }
    });
    
    // Вычисляем средний срок для каждого типа
    Object.values(paymentTypes).forEach(stats => {
        if (stats.paymentDays.length > 0) {
            stats.avgPaymentDays = stats.paymentDays.reduce((a, b) => a + b, 0) / stats.paymentDays.length;
        } else {
            stats.avgPaymentDays = null;
        }
    });
    
    // Общая статистика
    const totalPaymentsCount = buyerPaymentsData.length;
    const totalAmount = buyerPaymentsData.reduce((sum, p) => sum + (parseFloat(p['Выставленная сумма оплаты покупателем, CNY\n(Самойленко)']) || 0), 0);
    const paidPayments = buyerPaymentsData.filter(p => p['Статус оплаты'] !== 'не оплачено').length;
    const uniqueBuyers = Object.keys(buyerStats).length;
    
    // Средний срок оплаты по всем платежам
    const allPaymentDays = [];
    buyerPaymentsData.forEach(payment => {
        const sendDate = payment['Факт дата отправки документов для оплаты'];
        const receiveDate = payment['Дата прихода\n(Самойленко)'];
        
        if (sendDate && receiveDate) {
            const send = new Date(sendDate);
            const receive = new Date(receiveDate);
            const days = Math.round((receive - send) / (1000 * 60 * 60 * 24));
            
            if (days >= 0 && days < 365) {
                allPaymentDays.push(days);
            }
        }
    });
    
    const avgPaymentDays = allPaymentDays.length > 0 
        ? allPaymentDays.reduce((a, b) => a + b, 0) / allPaymentDays.length 
        : 0;
    
    // Отображение
    container.innerHTML = `
        <div class="payments-stats">
            <div class="payment-stat-card">
                <div class="stat-icon">💳</div>
                <div class="stat-value">${totalPaymentsCount.toLocaleString('ru-RU')}</div>
                <div class="stat-label">Всего платежей</div>
            </div>
            <div class="payment-stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${Math.round(totalAmount / 1000).toLocaleString('ru-RU')}</div>
                <div class="stat-label">Тыс. CNY выставлено</div>
            </div>
            <div class="payment-stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-value">${paidPayments.toLocaleString('ru-RU')}</div>
                <div class="stat-label">Оплачено</div>
            </div>
            <div class="payment-stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value">${uniqueBuyers}</div>
                <div class="stat-label">Покупателей</div>
            </div>
            <div class="payment-stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">${Math.round(avgPaymentDays)}</div>
                <div class="stat-label">Средний срок оплаты (дней)</div>
            </div>
        </div>
        
        <div class="payments-content">
            <div class="payments-section">
                <h3 class="payments-subtitle">💳 Статистика по типам платежей</h3>
                <div class="payment-types-grid">
                    ${Object.entries(paymentTypes)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([type, stats]) => `
                        <div class="payment-type-card">
                            <div class="payment-type-header">
                                <div class="payment-type-name">${type}</div>
                                <div class="payment-type-count">${stats.count} платежей</div>
                            </div>
                            <div class="payment-type-details">
                                <div class="detail-row">
                                    <span class="detail-label">💵 Сумма:</span>
                                    <span class="detail-value">${Math.round(stats.totalAmount / 1000).toLocaleString('ru-RU')} тыс. CNY</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">✅ Оплачено:</span>
                                    <span class="detail-value">${stats.paidCount} из ${stats.count}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">⏱️ Средний срок:</span>
                                    <span class="detail-value">${stats.avgPaymentDays !== null ? Math.round(stats.avgPaymentDays) + ' дн.' : 'нет данных'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="payments-section">
                <h3 class="payments-subtitle">🏆 Топ 10 покупателей по количеству платежей</h3>
                <div class="buyers-list">
                    ${topBuyersByCount.map(([buyer, stats], index) => `
                        <div class="buyer-item">
                            <div class="buyer-rank">#${index + 1}</div>
                            <div class="buyer-info">
                                <div class="buyer-name">${buyer}</div>
                                <div class="buyer-details">
                                    <span class="detail-badge">💳 ${stats.totalPayments} платежей</span>
                                    <span class="detail-badge">💵 ${Math.round(stats.totalAmount / 1000).toLocaleString('ru-RU')} тыс. CNY</span>
                                    <span class="detail-badge">⏱️ ${stats.avgPaymentDays !== null ? Math.round(stats.avgPaymentDays) + ' дн.' : 'нет данных'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="payments-section">
                <h3 class="payments-subtitle">💰 Топ 10 покупателей по сумме платежей</h3>
                <div class="buyers-list">
                    ${topBuyersByAmount.map(([buyer, stats], index) => `
                        <div class="buyer-item">
                            <div class="buyer-rank">#${index + 1}</div>
                            <div class="buyer-info">
                                <div class="buyer-name">${buyer}</div>
                                <div class="buyer-details">
                                    <span class="detail-badge">💵 ${Math.round(stats.totalAmount / 1000).toLocaleString('ru-RU')} тыс. CNY</span>
                                    <span class="detail-badge">💳 ${stats.totalPayments} платежей</span>
                                    <span class="detail-badge">⏱️ ${stats.avgPaymentDays !== null ? Math.round(stats.avgPaymentDays) + ' дн.' : 'нет данных'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadData);
