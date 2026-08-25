const ExcelJS = require('exceljs');
const path = require('path');

// NOTE: Run seedInquiry.js after this script to populate Sheet3 (Inquiry) from DB.
// seedInquiry.js preserves existing sheets and appends/replaces the Inquiry sheet.
async function seed() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'WISP Automation';
  wb.created = new Date();

  // ── Sheet 1: applicationAlerts ───────────────────────────────────────────
  const alertsSheet = wb.addWorksheet('applicationAlerts');
  alertsSheet.columns = [
    { header: 'TestCase',      key: 'testCase',      width: 15 },
    { header: 'FilterValue',   key: 'filterValue',   width: 25 },
    { header: 'FilterNoMatch', key: 'filterNoMatch', width: 30 },
    { header: 'LongBoundary',  key: 'longBoundary',  width: 60 },
    { header: 'EmptyBoundary', key: 'emptyBoundary', width: 30 },
  ];
  [
    { testCase: 'AL_WTC01', filterValue: 'PO Receiving', filterNoMatch: 'XYZXYZ_NO_MATCH_99999', longBoundary: '',             emptyBoundary: '' },
    { testCase: 'AL_WTC02', filterValue: 'PO Receiving', filterNoMatch: 'XYZXYZ_NO_MATCH_99999', longBoundary: '',             emptyBoundary: '' },
    { testCase: 'AL_WTC03', filterValue: '',              filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '' },
    { testCase: 'AL_WTC04', filterValue: 'PO',           filterNoMatch: 'XYZXYZ',                longBoundary: 'A'.repeat(50), emptyBoundary: 'ZZZZZZZZZZZ_BOUNDARY' },
    { testCase: 'AL_WTC05', filterValue: '',              filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '' },
  ].forEach(r => alertsSheet.addRow(r));

  // ── Sheet 2: planogram ───────────────────────────────────────────────────
  const planSheet = wb.addWorksheet('planogram');
  planSheet.columns = [
    { header: 'TestCase',               key: 'testCase',               width: 15 },
    { header: 'Feature',                key: 'feature',                width: 20 },
    { header: 'ExpectedErrorMsg',       key: 'expectedErrorMsg',       width: 55 },
    { header: 'ExpectedNoSelectionMsg', key: 'expectedNoSelectionMsg', width: 50 },
    { header: 'ExpectedSuccessMsg',     key: 'expectedSuccessMsg',     width: 35 },
    { header: 'ExpectedHistoryMsg',     key: 'expectedHistoryMsg',     width: 50 },
    { header: 'FilterNoMatch',          key: 'filterNoMatch',          width: 30 },
    { header: 'LongBoundary',           key: 'longBoundary',           width: 60 },
    { header: 'EmptyBoundary',          key: 'emptyBoundary',          width: 30 },
    { header: 'ActivationRoute',        key: 'activationRoute',        width: 25 },
    { header: 'DeactivationRoute',      key: 'deactivationRoute',      width: 25 },
  ];
  const ACT_ERR  = 'No records found for Activate POG';
  const ACT_NSEL = 'No Records selected for Activation';
  const DEACT_ERR  = 'No Records Found to Deactivate POG';
  const DEACT_NSEL = 'No Records selected for Deactivation';
  const DEACT_OK   = 'Deactivated successfully';
  const DEACT_HIST = "No History of Deactivated POG's found.";
  const ACT_HIST   = 'No Activated POGs History records Found.';
  const ACT_RT   = 'SBAPOGActivation';
  const DEACT_RT = 'SBAPOGDeActivation';
  [
    { testCase: 'PLN_WTC01', feature: 'Activation',         expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: ACT_NSEL, expectedSuccessMsg: '',       expectedHistoryMsg: '',        filterNoMatch: 'XYZXYZ_NO_MATCH_99999', longBoundary: 'A'.repeat(50), emptyBoundary: 'ZZZZZZZZZZZ_BOUNDARY', activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC02', feature: 'Activation',         expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: ACT_NSEL, expectedSuccessMsg: '',       expectedHistoryMsg: '',        filterNoMatch: 'XYZXYZ_NO_MATCH_99999', longBoundary: 'A'.repeat(50), emptyBoundary: 'ZZZZZZZZZZZ_BOUNDARY', activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC03', feature: 'Activation',         expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: ACT_NSEL, expectedSuccessMsg: '',       expectedHistoryMsg: '',        filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC04', feature: 'ActivationHistory',  expectedErrorMsg: ACT_HIST,  expectedNoSelectionMsg: '',       expectedSuccessMsg: '',       expectedHistoryMsg: ACT_HIST,  filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC05', feature: 'Activation',         expectedErrorMsg: ACT_ERR,   expectedNoSelectionMsg: '',       expectedSuccessMsg: '',       expectedHistoryMsg: '',        filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC06', feature: 'Deactivation',       expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: DEACT_NSEL, expectedSuccessMsg: DEACT_OK, expectedHistoryMsg: DEACT_HIST, filterNoMatch: '',                    longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC07', feature: 'Deactivation',       expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: DEACT_NSEL, expectedSuccessMsg: '',       expectedHistoryMsg: '',        filterNoMatch: 'XYZXYZ_NO_MATCH_99999', longBoundary: '',            emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC08', feature: 'Deactivation',       expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: '',       expectedSuccessMsg: DEACT_OK, expectedHistoryMsg: DEACT_HIST, filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC09', feature: 'DeactivationHistory',expectedErrorMsg: DEACT_ERR, expectedNoSelectionMsg: '',       expectedSuccessMsg: '',       expectedHistoryMsg: DEACT_HIST, filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
    { testCase: 'PLN_WTC10', feature: 'Module',             expectedErrorMsg: '',        expectedNoSelectionMsg: '',       expectedSuccessMsg: '',       expectedHistoryMsg: '',        filterNoMatch: '',                      longBoundary: '',             emptyBoundary: '',                     activationRoute: ACT_RT, deactivationRoute: DEACT_RT },
  ].forEach(r => planSheet.addRow(r));

  const out = path.join(__dirname, 'testData.xlsx');
  await wb.xlsx.writeFile(out);
  console.log('testData.xlsx written to:', out);
}

seed().catch(console.error);
