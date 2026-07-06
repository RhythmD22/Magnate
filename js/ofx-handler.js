(function () {
  'use strict';

  function stripOFXHeader(content) {
    const lines = content.split('\n');
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '' || line.startsWith('<')) {
        startIdx = i;
        break;
      }
    }
    return lines.slice(startIdx).join('\n');
  }

  function getTagContent(xml, tagName) {
    const openTag = '<' + tagName + '>';
    const closeTag = '</' + tagName + '>';

    let startIdx = xml.indexOf(openTag);
    if (startIdx === -1) return null;

    let pos = startIdx + openTag.length;
    let depth = 1;

    while (pos < xml.length && depth > 0) {
      const nextOpen = xml.indexOf(openTag, pos);
      const nextClose = xml.indexOf(closeTag, pos);

      if (nextClose === -1) {
        const nextAnyTag = xml.indexOf('<', pos);
        if (nextAnyTag === -1) return xml.substring(startIdx + openTag.length).trim();
        return xml.substring(startIdx + openTag.length, nextAnyTag).trim();
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + openTag.length;
      } else {
        depth--;
        if (depth === 0) {
          return xml.substring(startIdx + openTag.length, nextClose).trim();
        }
        pos = nextClose + closeTag.length;
      }
    }

    return xml.substring(startIdx + openTag.length).trim();
  }

  function extractAllBlocks(xml, tagName) {
    const results = [];
    const openTag = '<' + tagName + '>';
    const closeTag = '</' + tagName + '>';

    let startPos = 0;
    while (startPos < xml.length) {
      const startIdx = xml.indexOf(openTag, startPos);
      if (startIdx === -1) break;

      let pos = startIdx + openTag.length;
      let depth = 1;
      let found = false;

      while (pos < xml.length && depth > 0) {
        const nextOpen = xml.indexOf(openTag, pos);
        const nextClose = xml.indexOf(closeTag, pos);

        if (nextClose === -1) {
          results.push(xml.substring(startIdx + openTag.length).trim());
          found = true;
          break;
        }

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          pos = nextOpen + openTag.length;
        } else {
          depth--;
          if (depth === 0) {
            results.push(xml.substring(startIdx + openTag.length, nextClose).trim());
            found = true;
            pos = nextClose + closeTag.length;
            break;
          }
          pos = nextClose + closeTag.length;
        }
      }

      if (!found) {
        results.push(xml.substring(startIdx + openTag.length).trim());
        break;
      }
      startPos = pos;
    }

    return results;
  }

  function parseOFXDate(dateStr) {
    if (!dateStr || dateStr.length < 8) return null;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    let day = dateStr.substring(6, 8);
    if (day === '00') day = '01';
    const parsed = new Date(+year, +month - 1, +day);
    if (isNaN(parsed.getTime())) return null;
    return MagnateUtils.convertToUSFormat(year + '-' + month + '-' + day);
  }

  function parseTransactionBlock(block) {
    const trnType = getTagContent(block, 'TRNTYPE') || '';
    const dtPosted = getTagContent(block, 'DTPOSTED') || '';
    const trnAmt = getTagContent(block, 'TRNAMT') || '0';
    const name = getTagContent(block, 'NAME') || '';
    const memo = getTagContent(block, 'MEMO') || '';

    const date = parseOFXDate(dtPosted);
    if (!date) return null;

    const amount = parseFloat(trnAmt);
    if (isNaN(amount) || amount === 0) return null;

    const title = name || memo || 'Unknown Transaction';

    return {
      date: date,
      amount: amount,
      title: title
    };
  }

  function parseOFXContent(xmlBody) {
    const transactions = [];

    const ofxBlock = extractAllBlocks(xmlBody, 'OFX');
    const searchBlock = ofxBlock.length > 0 ? ofxBlock[0] : xmlBody;

    const bankMsgBlocks = extractAllBlocks(searchBlock, 'BANKMSGSRSV1');
    const ccMsgBlocks = extractAllBlocks(searchBlock, 'CREDITCARDMSGSRSV1');

    function processStatements(msgBlock) {
      const stmtTrnRsBlocks = extractAllBlocks(msgBlock, 'STMTTRNRS');
      const ccStmtBlocks = extractAllBlocks(msgBlock, 'CCSTMTTRNRS');
      const stmtBlocks = stmtTrnRsBlocks.concat(ccStmtBlocks);

      stmtBlocks.forEach(function (stmtTrnRs) {
        const stmtRs = getTagContent(stmtTrnRs, 'STMTRS') ||
          getTagContent(stmtTrnRs, 'CCSTMTRS');
        if (!stmtRs) return;

        const bankTranList = getTagContent(stmtRs, 'BANKTRANLIST');
        if (!bankTranList) return;

        const stmtTrnBlocks = extractAllBlocks(bankTranList, 'STMTTRN');
        stmtTrnBlocks.forEach(function (block) {
          const parsed = parseTransactionBlock(block);
          if (parsed) {
            transactions.push(parsed);
          }
        });
      });
    }

    bankMsgBlocks.forEach(processStatements);
    ccMsgBlocks.forEach(processStatements);

    return transactions;
  }

  function importOFX() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ofx,.qfx,.qbo,.OFX,.QFX,.QBO';
    input.onchange = function (event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function (e) {
        const content = e.target.result;
        try {
          const xmlBody = stripOFXHeader(content);
          const transactions = parseOFXContent(xmlBody);

          if (transactions.length === 0) {
            await MagnateUI.alert('No transactions found in this file. Please make sure it is a valid OFX, QFX, or QBO file.');
            return;
          }

          let expenseCount = 0;
          let incomeCount = 0;
          const newExpenses = [];
          const newIncomes = [];

          transactions.forEach(function (t) {
            if (t.amount < 0) {
              newExpenses.push({
                id: MagnateUtils.generateId(),
                date: t.date,
                title: t.title,
                amount: t.amount,
                category: ''
              });
              expenseCount++;
            } else {
              newIncomes.push({
                id: MagnateUtils.generateId(),
                date: t.date,
                title: t.title,
                amount: t.amount,
                category: ''
              });
              incomeCount++;
            }
          });

          let summary = 'Found ' + transactions.length + ' transaction(s) in this file:\n';
          summary += expenseCount + ' expense(s), ' + incomeCount + ' income(s)\n\n';
          summary += 'Import them? They will be added to your existing data.';

          const confirmed = await MagnateUI.confirm(summary);
          if (!confirmed) return;

          MagnateData.loadData();
          MagnateData.expenses = MagnateData.expenses.concat(newExpenses);
          MagnateData.incomes = MagnateData.incomes.concat(newIncomes);
          MagnateData.saveData();

          await MagnateUI.alert('Successfully imported ' + transactions.length + ' transaction(s)!');
          location.reload();
        } catch (err) {
          console.error('OFX parse error:', err);
          await MagnateUI.alert('Failed to parse this file. Make sure it is a valid OFX, QFX, or QBO file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  window.MagnateOFX = {
    importOFX: importOFX,
    _parseOFXContent: parseOFXContent,
    _parseTransactionBlock: parseTransactionBlock,
    _parseOFXDate: parseOFXDate,
    _getTagContent: getTagContent,
    _extractAllBlocks: extractAllBlocks,
    _stripOFXHeader: stripOFXHeader
  };
})();