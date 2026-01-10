/**
 * Скрипт для экспорта данных из Google Таблицы в JSON
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Откройте вашу Google Таблицу
 * 2. Расширения -> Apps Script
 * 3. Скопируйте код ниже
 * 4. Замените SPREADSHEET_ID на ID вашей таблицы (из URL)
 * 5. Сохраните и запустите функцию
 */

// ============================================
// ВАРИАНТ 1: Сохранение JSON в Google Drive
// ============================================

function exportToJsonFile() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Лист1');
  
  if (!sheet) {
    throw new Error('Лист "Лист 1" не найден!');
  }
  
  // Получаем все данные до столбца AZ (52-й столбец)
  const lastRow = sheet.getLastRow();
  const lastCol = 52; // AZ = 52-й столбец (включая поле "Агент")
  
  if (lastRow < 2) {
    throw new Error('Нет данных для экспорта!');
  }
  
  // Получаем заголовки (первая строка)
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Получаем все данные (со второй строки)
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  // Преобразуем в массив объектов
  const jsonData = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      // Пропускаем пустые заголовки
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  // Создаем JSON
  const json = JSON.stringify(jsonData, null, 2);
  
  // Сохраняем в Google Drive
  const fileName = `Итоги_года_${new Date().toISOString().split('T')[0]}.json`;
  const file = DriveApp.createFile(fileName, json, 'application/json');
  
  Logger.log('JSON файл создан: ' + file.getUrl());
  
  // Показываем уведомление с ссылкой
  SpreadsheetApp.getUi().alert(
    'Успешно экспортировано!',
    'Файл сохранен в Google Drive:\n' + file.getUrl(),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return file.getUrl();
}


// ============================================
// ВАРИАНТ 2: Отправка данных на webhook
// ============================================

function sendToWebhook() {
  const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // Замените на ваш URL
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Лист 1');
  
  if (!sheet) {
    throw new Error('Лист "Лист 1" не найден!');
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = 50; // AX
  
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
  
  // Отправляем POST запрос
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify({
      timestamp: new Date().toISOString(),
      dataCount: jsonData.length,
      data: jsonData
    })
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log('Отправлено успешно: ' + response.getContentText());
    
    SpreadsheetApp.getUi().alert(
      'Данные отправлены!',
      'Статус: ' + response.getResponseCode(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    Logger.log('Ошибка отправки: ' + error);
    SpreadsheetApp.getUi().alert('Ошибка: ' + error);
  }
}


// ============================================
// ВАРИАНТ 3: Веб-приложение для получения JSON
// ============================================

function doGet(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Лист 1');
  
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Лист не найден' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = 50;
  
  if (lastRow < 2) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Нет данных', data: [] })
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
  
  const result = {
    timestamp: new Date().toISOString(),
    count: jsonData.length,
    data: jsonData
  };
  
  return ContentService.createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================
// ВАРИАНТ 4: Экспорт с фильтрацией и статистикой
// ============================================

function exportWithStats() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Лист 1');
  
  if (!sheet) {
    throw new Error('Лист "Лист 1" не найден!');
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = 50;
  
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
  
  // Базовая статистика
  const stats = {
    totalRecords: jsonData.length,
    exportDate: new Date().toISOString(),
    columns: headers.filter(h => h).length,
    // Добавьте свою логику для подсчета статистики
  };
  
  const result = {
    metadata: stats,
    data: jsonData
  };
  
  const json = JSON.stringify(result, null, 2);
  const fileName = `Итоги_года_2025_${new Date().toISOString().split('T')[0]}.json`;
  const file = DriveApp.createFile(fileName, json, 'application/json');
  
  Logger.log('Экспорт завершен: ' + file.getUrl());
  Logger.log('Всего записей: ' + stats.totalRecords);
  
  SpreadsheetApp.getUi().alert(
    'Экспорт завершен!',
    `Записей: ${stats.totalRecords}\nСтолбцов: ${stats.columns}\nФайл: ${file.getUrl()}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  return result;
}


// ============================================
// УТИЛИТЫ
// ============================================

/**
 * Создает меню в таблице для быстрого доступа
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Экспорт данных')
    .addItem('💾 Сохранить в JSON (Drive)', 'exportToJsonFile')
    .addItem('🚀 Отправить на webhook', 'sendToWebhook')
    .addItem('📈 Экспорт со статистикой', 'exportWithStats')
    .addToUi();
}

/**
 * Получает превью данных (первые 5 строк)
 */
function getPreview() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Лист 1');
  
  if (!sheet) {
    Logger.log('Лист не найден');
    return null;
  }
  
  const headers = sheet.getRange(1, 1, 1, 50).getValues()[0];
  const data = sheet.getRange(2, 1, Math.min(5, sheet.getLastRow() - 1), 50).getValues();
  
  const preview = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });
  
  Logger.log(JSON.stringify(preview, null, 2));
  return preview;
}
