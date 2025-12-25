console.log('📊 Script.js v4 - Обновленный дизайн с глитч-эффектом!');

// Глобальные переменные
let dealsData = [];
let monthlyChart = null;
let basisChart = null;
let geographyChart = null;

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
        const response = await fetch('Итоги_года_2025-12-25.json');
        const data = await response.json();
        
        // Фильтруем только сделки 2025 года
        dealsData = data.filter(deal => {
            const confirmDate = deal['Дата подтверждения сделки'];
            if (!confirmDate) return false;
            const year = new Date(confirmDate).getFullYear();
            return year === 2025;
        });
        
        console.log(`Загружено ${dealsData.length} сделок 2025 года`);
        
        // Инициализация всех секций
        displayHeroStats();
        displayMonthlyChart();
        displayTopClients();
        displayTopProducts();
        displayAvgPrices();
        displayBasisChart();
        displayGeographyChart();
        displayRecordDeal();
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

// Топ клиенты
function displayTopClients() {
    const clientsData = {};
    
    dealsData.forEach(deal => {
        const client = deal['Покупатель'] || 'Не указан';
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

// Инициализация
document.addEventListener('DOMContentLoaded', loadData);
