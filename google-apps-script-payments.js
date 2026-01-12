/**
 * Скрипт для экспорта данных с листа "Получение средств" в JSON
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Откройте вашу Google Таблицу
 * 2. Расширения -> Apps Script
 * 3. Скопируйте код ниже
 * 4. Сохраните и запустите функцию exportPaymentsToJson
 */

// ============================================
// ЭКСПОРТ ЛИСТА "ПОЛУЧЕНИЕ СРЕДСТВ"
// ============================================

function exportPaymentsToJson() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Получение средств');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert(
      'Ошибка!',
      'Лист "Получение средств" не найден!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert(
      'Ошибка!',
      'Лист "Получение средств" пустой!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // Получаем заголовки
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Получаем данные
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  // Преобразуем в массив объектов
  const jsonData = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  // Создаем JSON
  const json = JSON.stringify(jsonData, null, 2);
  
  // Сохраняем в Google Drive
  const fileName = `payments_${new Date().toISOString().split('T')[0]}.json`;
  const file = DriveApp.createFile(fileName, json, 'application/json');
  
  Logger.log('JSON файл создан: ' + file.getUrl());
  Logger.log(`Экспортировано записей: ${jsonData.length}`);
  
  SpreadsheetApp.getUi().alert(
    'Успешно экспортировано!',
    `Записей: ${jsonData.length}\nФайл сохранен в Google Drive:\n${file.getUrl()}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return file.getUrl();
}


// ============================================
// ЭКСПОРТ СО СТАТИСТИКОЙ
// ============================================

function exportPaymentsWithStats() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Получение средств');
  
  if (!sheet) {
    throw new Error('Лист "Получение средств" не найден!');
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) {
    throw new Error('Нет данных для экспорта!');
  }
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  const jsonData = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  // Рассчитываем статистику
  let totalAmount = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  
  jsonData.forEach(payment => {
    const amount = parseFloat(payment['Сумма поступления в cny\n(Самойленко)']) || 0;
    totalAmount += amount;
    
    if (payment['Статус оплаты'] === 'оплачено') {
      paidCount++;
    } else if (payment['Статус оплаты'] === 'не оплачено') {
      unpaidCount++;
    }
  });
  
  const stats = {
    totalRecords: jsonData.length,
    exportDate: new Date().toISOString(),
    columns: headers.filter(h => h).length,
    totalAmount: totalAmount,
    paidCount: paidCount,
    unpaidCount: unpaidCount,
    averageAmount: totalAmount / jsonData.length
  };
  
  const result = {
    metadata: stats,
    payments: jsonData
  };
  
  const json = JSON.stringify(result, null, 2);
  const fileName = `payments_with_stats_${new Date().toISOString().split('T')[0]}.json`;
  const file = DriveApp.createFile(fileName, json, 'application/json');
  
  Logger.log('Экспорт завершен: ' + file.getUrl());
  Logger.log('Статистика:');
  Logger.log(`- Всего записей: ${stats.totalRecords}`);
  Logger.log(`- Общая сумма: ${stats.totalAmount.toFixed(2)} CNY`);
  Logger.log(`- Оплачено: ${stats.paidCount}`);
  Logger.log(`- Не оплачено: ${stats.unpaidCount}`);
  
  SpreadsheetApp.getUi().alert(
    'Экспорт завершен!',
    `Записей: ${stats.totalRecords}\n` +
    `Общая сумма: ${stats.totalAmount.toFixed(2)} CNY\n` +
    `Оплачено: ${stats.paidCount}\n` +
    `Не оплачено: ${stats.unpaidCount}\n\n` +
    `Файл: ${file.getUrl()}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return result;
}


// ============================================
// ФИЛЬТР ПО СТАТУСУ ОПЛАТЫ
// ============================================

function exportPaidPayments() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Получение средств');
  
  if (!sheet) {
    throw new Error('Лист "Получение средств" не найден!');
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) {
    throw new Error('Нет данных для экспорта!');
  }
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  const allData = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  // Фильтруем только оплаченные
  const paidPayments = allData.filter(payment => 
    payment['Статус оплаты'] === 'оплачено'
  );
  
  const json = JSON.stringify(paidPayments, null, 2);
  const fileName = `payments_paid_only_${new Date().toISOString().split('T')[0]}.json`;
  const file = DriveApp.createFile(fileName, json, 'application/json');
  
  Logger.log('Экспорт оплаченных платежей: ' + file.getUrl());
  Logger.log(`Оплаченных платежей: ${paidPayments.length} из ${allData.length}`);
  
  SpreadsheetApp.getUi().alert(
    'Экспорт завершен!',
    `Оплаченных платежей: ${paidPayments.length} из ${allData.length}\n` +
    `Файл: ${file.getUrl()}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return paidPayments;
}


// ============================================
// ВЕБ-ПРИЛОЖЕНИЕ ДЛЯ API
// ============================================

function doGet(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Получение средств');
  
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Лист "Получение средств" не найден' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Нет данных', payments: [] })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  const jsonData = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  // Фильтрация по параметрам (опционально)
  const status = e.parameter.status; // ?status=оплачено
  let filteredData = jsonData;
  
  if (status) {
    filteredData = jsonData.filter(payment => 
      payment['Статус оплаты'] === status
    );
  }
  
  const result = {
    timestamp: new Date().toISOString(),
    count: filteredData.length,
    totalCount: jsonData.length,
    payments: filteredData
  };
  
  return ContentService.createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================
// СОЗДАНИЕ МЕНЮ
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💰 Экспорт платежей')
    .addItem('📥 Экспорт всех платежей', 'exportPaymentsToJson')
    .addItem('📊 Экспорт со статистикой', 'exportPaymentsWithStats')
    .addItem('✅ Только оплаченные', 'exportPaidPayments')
    .addSeparator()
    .addItem('👀 Превью данных', 'previewPayments')
    .addToUi();
}


// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Показывает превью первых 5 записей
 */
function previewPayments() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Получение средств');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Лист "Получение средств" не найден!');
    return;
  }
  
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const previewRows = Math.min(5, sheet.getLastRow() - 1);
  
  if (previewRows < 1) {
    SpreadsheetApp.getUi().alert('Нет данных для превью');
    return;
  }
  
  const data = sheet.getRange(2, 1, previewRows, lastCol).getValues();
  
  const preview = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  Logger.log('Превью данных (первые ' + previewRows + ' записей):');
  Logger.log(JSON.stringify(preview, null, 2));
  
  // Формируем текст для показа пользователю
  let previewText = `Первые ${previewRows} записей:\n\n`;
  preview.forEach((payment, index) => {
    previewText += `${index + 1}. ${payment['Покупатель'] || 'Н/Д'} - `;
    previewText += `${payment['Статус оплаты'] || 'Н/Д'}\n`;
  });
  
  SpreadsheetApp.getUi().alert('Превью данных', previewText, SpreadsheetApp.getUi().ButtonSet.OK);
  
  return preview;
}
