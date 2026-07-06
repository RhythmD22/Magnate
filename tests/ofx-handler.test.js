import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupGlobals, loadOFXHandler, resetAll } from './helpers.js';

setupGlobals();

let MagnateOFX, MagnateUtils;

beforeEach(() => {
  resetAll();
  MagnateOFX = loadOFXHandler();
  MagnateUtils = globalThis.MagnateUtils;
});

describe('_stripOFXHeader', () => {
  it('removes OFX header lines before the XML body', () => {
    const input = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>
      <DTSERVER>20240115</DTSERVER>
    </SONRS>
  </SIGNONMSGSRSV1>
</OFX>`;

    const result = MagnateOFX._stripOFXHeader(input);
    assert.ok(result.trim().startsWith('<OFX>'));
    assert.strictEqual(result.includes('OFXHEADER'), false);
  });

  it('handles content without headers', () => {
    const input = `<OFX><TXNLIST></TXNLIST></OFX>`;
    const result = MagnateOFX._stripOFXHeader(input);
    assert.strictEqual(result, input);
  });
});

describe('_getTagContent', () => {
  it('extracts content of a simple tag', () => {
    const xml = '<NAME>Starbucks Coffee</NAME>';
    assert.strictEqual(MagnateOFX._getTagContent(xml, 'NAME'), 'Starbucks Coffee');
  });

  it('extracts content of a tag with surrounding XML', () => {
    const xml = '<STMTTRN><TRNTYPE>DEBIT</TRNTYPE><NAME>Coffee</NAME></STMTTRN>';
    assert.strictEqual(MagnateOFX._getTagContent(xml, 'NAME'), 'Coffee');
    assert.strictEqual(MagnateOFX._getTagContent(xml, 'TRNTYPE'), 'DEBIT');
  });

  it('returns null for missing tag', () => {
    const xml = '<NAME>Test</NAME>';
    assert.strictEqual(MagnateOFX._getTagContent(xml, 'MISSING'), null);
  });

  it('handles nested tags of same name', () => {
    const xml = '<OUTER><INNER>value</INNER></OUTER>';
    assert.strictEqual(MagnateOFX._getTagContent(xml, 'OUTER'), '<INNER>value</INNER>');
  });

  it('extracts content from tag with attributes', () => {
    const xml = '<STMTTRN><NAME>Food</NAME><TRNAMT>-12.50</TRNAMT></STMTTRN>';
    assert.strictEqual(MagnateOFX._getTagContent(xml, 'TRNAMT'), '-12.50');
  });
});

describe('_extractAllBlocks', () => {
  it('extracts multiple blocks of the same tag', () => {
    const xml = '<STMTTRN><TRNTYPE>DEBIT</TRNTYPE></STMTTRN><STMTTRN><TRNTYPE>CREDIT</TRNTYPE></STMTTRN>';
    const blocks = MagnateOFX._extractAllBlocks(xml, 'STMTTRN');
    assert.strictEqual(blocks.length, 2);
    assert.ok(blocks[0].includes('DEBIT'));
    assert.ok(blocks[1].includes('CREDIT'));
  });

  it('returns empty array when no blocks found', () => {
    const xml = '<OTHER>content</OTHER>';
    const blocks = MagnateOFX._extractAllBlocks(xml, 'STMTTRN');
    assert.deepStrictEqual(blocks, []);
  });

  it('handles nested blocks', () => {
    const xml = '<OUTER><INNER>a</INNER></OUTER><OUTER><INNER>b</INNER></OUTER>';
    const blocks = MagnateOFX._extractAllBlocks(xml, 'OUTER');
    assert.strictEqual(blocks.length, 2);
  });
});

describe('_parseOFXDate', () => {
  it('parses YYYYMMDD format', () => {
    const result = MagnateOFX._parseOFXDate('20240115');
    assert.ok(result);
    assert.strictEqual(result, '01/15/2024');
  });

  it('parses YYYYMMDDHHMMSS format', () => {
    const result = MagnateOFX._parseOFXDate('20240115120000');
    assert.ok(result);
    assert.strictEqual(result, '01/15/2024');
  });

  it('parses YYYYMMDD with timezone', () => {
    const result = MagnateOFX._parseOFXDate('20240115120000[-5:EST]');
    assert.ok(result);
    assert.strictEqual(result, '01/15/2024');
  });

  it('returns null for invalid date strings', () => {
    assert.strictEqual(MagnateOFX._parseOFXDate(''), null);
    assert.strictEqual(MagnateOFX._parseOFXDate(null), null);
    assert.strictEqual(MagnateOFX._parseOFXDate('abc'), null);
    assert.strictEqual(MagnateOFX._parseOFXDate('12345'), null);
    assert.strictEqual(MagnateOFX._parseOFXDate('abcdefgh'), null);
  });

  it('handles day=00 by defaulting to 01', () => {
    const result = MagnateOFX._parseOFXDate('20240100');
    assert.ok(result);
    assert.strictEqual(result, '01/01/2024');
  });
});

describe('_parseTransactionBlock', () => {
  it('parses a standard DEBIT transaction', () => {
    const block = `<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115120000</DTPOSTED>
<TRNAMT>-12.50</TRNAMT>
<NAME>Starbucks</NAME>
<MEMO>Coffee</MEMO>
</STMTTRN>`;

    const result = MagnateOFX._parseTransactionBlock(block);
    assert.ok(result);
    assert.strictEqual(result.title, 'Starbucks');
    assert.strictEqual(result.amount, -12.50);
    assert.strictEqual(result.date, '01/15/2024');
  });

  it('parses a credit transaction', () => {
    const block = `<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20240116</DTPOSTED>
<TRNAMT>5000.00</TRNAMT>
<NAME>Salary Deposit</NAME>
</STMTTRN>`;

    const result = MagnateOFX._parseTransactionBlock(block);
    assert.ok(result);
    assert.strictEqual(result.title, 'Salary Deposit');
    assert.strictEqual(result.amount, 5000.00);
    assert.strictEqual(result.date, '01/16/2024');
  });

  it('uses MEMO as title when NAME is missing', () => {
    const block = `<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>-5.00</TRNAMT>
<MEMO>ATM Withdrawal</MEMO>
</STMTTRN>`;

    const result = MagnateOFX._parseTransactionBlock(block);
    assert.ok(result);
    assert.strictEqual(result.title, 'ATM Withdrawal');
  });

  it('returns null for transaction without valid date', () => {
    const block = `<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<TRNAMT>-5.00</TRNAMT>
<NAME>Test</NAME>
</STMTTRN>`;

    const result = MagnateOFX._parseTransactionBlock(block);
    assert.strictEqual(result, null);
  });

  it('returns null for zero-amount transactions', () => {
    const block = `<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>0.00</TRNAMT>
<NAME>Test</NAME>
</STMTTRN>`;

    const result = MagnateOFX._parseTransactionBlock(block);
    assert.strictEqual(result, null);
  });

  it('uses Unknown Transaction when both NAME and MEMO are empty', () => {
    const block = `<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20240115</DTPOSTED>
<TRNAMT>-10.00</TRNAMT>
</STMTTRN>`;

    const result = MagnateOFX._parseTransactionBlock(block);
    assert.ok(result);
    assert.strictEqual(result.title, 'Unknown Transaction');
    assert.strictEqual(result.amount, -10);
  });
});

describe('_parseOFXContent', () => {
  it('parses transactions from a bank statement', () => {
    const xmlBody = `
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240115</DTPOSTED>
            <TRNAMT>-12.50</TRNAMT>
            <NAME>Starbucks</NAME>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240116</DTPOSTED>
            <TRNAMT>-45.00</TRNAMT>
            <NAME>Grocery Store</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const transactions = MagnateOFX._parseOFXContent(xmlBody);
    assert.strictEqual(transactions.length, 2);
    assert.strictEqual(transactions[0].title, 'Starbucks');
    assert.strictEqual(transactions[0].amount, -12.50);
    assert.strictEqual(transactions[1].title, 'Grocery Store');
    assert.strictEqual(transactions[1].amount, -45.00);
  });

  it('parses transactions from a credit card statement', () => {
    const xmlBody = `
<OFX>
  <CREDITCARDMSGSRSV1>
    <CCSTMTTRNRS>
      <CCSTMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240120</DTPOSTED>
            <TRNAMT>-99.99</TRNAMT>
            <NAME>Online Purchase</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </CCSTMTRS>
    </CCSTMTTRNRS>
  </CREDITCARDMSGSRSV1>
</OFX>`;

    const transactions = MagnateOFX._parseOFXContent(xmlBody);
    assert.strictEqual(transactions.length, 1);
    assert.strictEqual(transactions[0].title, 'Online Purchase');
    assert.strictEqual(transactions[0].amount, -99.99);
    assert.strictEqual(transactions[0].date, '01/20/2024');
  });

  it('handles OFX files with both bank and credit card statements', () => {
    const xmlBody = `
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240110</DTPOSTED>
            <TRNAMT>-20.00</TRNAMT>
            <NAME>Bank Transaction</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
  <CREDITCARDMSGSRSV1>
    <CCSTMTTRNRS>
      <CCSTMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240112</DTPOSTED>
            <TRNAMT>-50.00</TRNAMT>
            <NAME>CC Transaction</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </CCSTMTRS>
    </CCSTMTTRNRS>
  </CREDITCARDMSGSRSV1>
</OFX>`;

    const transactions = MagnateOFX._parseOFXContent(xmlBody);
    assert.strictEqual(transactions.length, 2);
    assert.strictEqual(transactions[0].title, 'Bank Transaction');
    assert.strictEqual(transactions[1].title, 'CC Transaction');
  });

  it('returns empty array for OFX with no transaction list', () => {
    const xmlBody = `
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const transactions = MagnateOFX._parseOFXContent(xmlBody);
    assert.deepStrictEqual(transactions, []);
  });

  it('handles empty OFX content', () => {
    const transactions = MagnateOFX._parseOFXContent('<OFX></OFX>');
    assert.deepStrictEqual(transactions, []);
  });

  it('skips transactions with invalid dates', () => {
    const xmlBody = `
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>bad-date</DTPOSTED>
            <TRNAMT>-10.00</TRNAMT>
            <NAME>Bad Date</NAME>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20240115</DTPOSTED>
            <TRNAMT>-20.00</TRNAMT>
            <NAME>Good Date</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const transactions = MagnateOFX._parseOFXContent(xmlBody);
    assert.strictEqual(transactions.length, 1);
    assert.strictEqual(transactions[0].title, 'Good Date');
  });
});