import ExcelJS from 'exceljs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '..', 'test-data', 'testData.xlsx');

export interface AlertsTestData {
  testCase: string;
  filterValue: string;
  filterNoMatch: string;
  longBoundary: string;
  emptyBoundary: string;
}

export interface PlanogramTestData {
  testCase: string;
  feature: string;
  expectedErrorMsg: string;
  expectedNoSelectionMsg: string;
  expectedSuccessMsg: string;
  expectedHistoryMsg: string;
  filterNoMatch: string;
  longBoundary: string;
  emptyBoundary: string;
  activationRoute: string;
  deactivationRoute: string;
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

async function readSheet<T>(sheetName: string): Promise<T[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_FILE);
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${DATA_FILE}`);

  const headers: string[] = [];
  const rows: T[] = [];

  sheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) {
      row.eachCell(cell => headers.push(toCamelCase(String(cell.value ?? '').trim())));
      return;
    }
    const obj: Record<string, string> = {};
    row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
      const h = headers[colIndex - 1];
      if (h) obj[h] = String(cell.value ?? '').trim();
    });
    if (Object.values(obj).some(v => v !== '')) rows.push(obj as unknown as T);
  });

  return rows;
}

export async function getAlertsTestData(): Promise<AlertsTestData[]> {
  return readSheet<AlertsTestData>('applicationAlerts');
}

export async function getPlanogramTestData(): Promise<PlanogramTestData[]> {
  return readSheet<PlanogramTestData>('planogram');
}

export interface OrderReceivingTestData {
  testCase: string;
  feature: string;
  openPoNumber: string;
  openVendorName: string;
  openVendorNo: string;
  artistreePoNumber: string;
  artistreeVendorName: string;
  fullyReceivedPoNumber: string;
  poWithSessionNumber: string;
  sessionCartonId: string;
  validSkuNo: string;
  vendorNo: string;
  vendorName: string;
  filterNoMatch: string;
  expectedFilterMsg: string;
  expectedEmptyCritMsg: string;
  expectedCancelPOMsg: string;
  expectedCancelItmMsg: string;
  expectedNoPOSelectMsg: string;
  expectedPrintNoSelMsg: string;
  expectedAuditNoCarton: string;
  expectedAuditNoAudit: string;
  expectedFinalizeMsg: string;
  expectedNoItemsMsg: string;
  expectedReceiveAllMsg: string;
  expectedClearMsg: string;
  wsNoSelFinalizeMsg: string;
  wsNoItemsFinalizeMsg: string;
  wsNoVendorSelectMsg: string;
}

export async function getOrderReceivingTestData(): Promise<OrderReceivingTestData[]> {
  return readSheet<OrderReceivingTestData>('OrderReceiving');
}

export interface InventoryAdjustmentsTestData {
  testCase: string;
  feature: string;
  validSkuNo: string;
  validUpcNo: string;
  validItemDesc: string;
  openRtvRaNo: string;
  finalizedRtvRaNo: string;
  vendorName: string;
  destStoreNo: string;
  filterNoMatch: string;
  invalidSkuNo: string;
  validQty: string;
  overMaxQty: string;
  expectedRaRequired: string;
  expectedItemAdded: string;
  expectedRtvFinalized: string;
  expectedPrintNoFinalized: string;
  expectedDeleteBlocked: string;
  expectedItemNotFound: string;
  expectedBlankSkuMsg: string;
  expectedQohSameMsg: string;
  expectedQohInvalidQty: string;
  expectedQohPrintNoWS: string;
  expectedNohNoItems: string;
  expectedNohInvalidQty: string;
  expectedIaHistNoRecords: string;
  expectedTransferNoSel: string;
  expectedTransferNoItems: string;
  expectedTransferDelFinalized: string;
  expectedTransferPrintNotFin: string;
  iaHistoryHasRecords: string;
  qohHasRecords: string;
  nohHasRecords: string;
  openTransferExists: string;
  finalizedTransferExists: string;
}

export async function getInventoryAdjustmentsTestData(): Promise<InventoryAdjustmentsTestData[]> {
  return readSheet<InventoryAdjustmentsTestData>('InventoryAdjustments');
}

export interface LabelRequestTestData {
  validSkuNo: string;
  validUpcNo: string;
  validItemDesc: string;
  invalidSkuNo: string;
  validPlanogramDept: string;
  validPlanogramNo: string;
  validPlanogramLevel: string;
  validPlanogramDesc: string;
  invalidPlanogramDept: string;
  invalidPlanogramNo: string;
  invalidPlanogramLevel: string;
  itemMaintenanceHasRecords: string;
  itemMaintenanceReason: string;
  massLabelHasItems: string;
  massLabelClearanceCount: string;
  hasLabelSpecs: string;
  printUser: string;
  validPrice: string;
  validQty: string;
  largeQty: string;
  invalidPrice: string;
  negativeQty: string;
  zeroQty: string;
  filterNoMatch: string;
  expectedNoRecordsMsg: string;
  expectedNoSelDeleteMsg: string;
  expectedPrintNoItemsMsg: string;
  expectedPlanoNoItemsMsg: string;
  expectedPlanoPrintNoSelMsg: string;
  expectedMassNoCbMsg: string;
  expectedInvalidPriceMsg: string;
  expectedInvalidQtyMsg: string;
  planogramPrintFrom: string;
  planogramPrintTo: string;
}

export async function getLabelRequestTestData(): Promise<LabelRequestTestData[]> {
  return readSheet<LabelRequestTestData>('LabelRequest');
}

export interface PriceChangeActivationTestData {
  validEventNo: string;
  validBatchNo: string;
  validSkuNo: string;
  validUpcNo: string;
  validNewPrice: string;
  pendingEventNo: string;
  pendingBatchNo: string;
  pendingSkuNo: string;
  activatedEventNo: string;
  nonExistentEventNo: string;
  nonExistentBatchNo: string;
  nonExistentSkuNo: string;
  hasEvents: string;
  hasPendingEvents: string;
  totalEvents: string;
  expectedNoItemsActivate: string;
  expectedSkuActivateMsg: string;
  expectedPrevPostedMsg: string;
  expectedZeroCountMsg: string;
  expectedActivatePopupTitle: string;
  expectedActivationSuccess: string;
  expectedActivateFail: string;
  expectedNoItemsPrintWkst: string;
  expectedSkuPrintWkst: string;
  expectedZeroCountPrintWkst: string;
  expectedPrintInProgress: string;
  expectedNoItemsPrintLabels: string;
  expectedSkuPrintLabels: string;
  expectedTooManyItemsMsg: string;
  expectedNoEventsMsg: string;
  expectedNoBatchesMsg: string;
  expectedNoSkusMsg: string;
  expectedEventNotFound: string;
  expectedEmptySearchMsg: string;
}

export async function getPriceChangeActivationTestData(): Promise<PriceChangeActivationTestData[]> {
  return readSheet<PriceChangeActivationTestData>('PriceChangeActivation');
}

export interface GenericSKUListBuilderTestData {
  testCase: string;
  feature: string;
  validSku1: string;
  validSku1Desc: string;
  validSku2: string;
  validSku2Desc: string;
  validSku3: string;
  validSku3Desc: string;
  validUpc1: string;
  invalidSku: string;
  defaultListType: string;
  validQty: string;
  overMaxQty: string;
  warnQty: string;
  validReference: string;
  expectedMaxQtyMsg: string;
  expectedItemExistsMsg: string;
  expectedInvalidSkuMsg: string;
  expectedNoRecordsMsg: string;
  expectedFinalizeCompleteMsg: string;
  expectedClearMsg: string;
  expectedClearSuccessMsg: string;
  expectedRefReqMsg: string;
  expectedDeleteConfirmMsg: string;
  listTypeClearance: string;
  listTypeGeneric: string;
  listTypeNotOnPog: string;
  listTypeNewStore: string;
  listTypePackaway: string;
}

export async function getGenericSKUListBuilderTestData(): Promise<GenericSKUListBuilderTestData[]> {
  return readSheet<GenericSKUListBuilderTestData>('GenericSKUListBuilder');
}

export interface UserManagementTestData {
  existingUsername: string;
  existingUserFullName: string;
  existingUserRole: string;
  editableUsername: string;
  editableUserFullName: string;
  editableUserRole: string;
  availableRole1: string;
  availableRole2: string;
  newUserPassword: string;
  filterNoMatch: string;
  expectedCreateSuccess: string;
  expectedUpdateSuccess: string;
  expectedPasswordMismatch: string;
  expectedUsernameRequired: string;
  expectedRoleRequired: string;
  expectedDuplicateUser: string;
}

export async function getUserManagementTestData(): Promise<UserManagementTestData[]> {
  return readSheet<UserManagementTestData>('UserManagement');
}

export interface ItemInquiryTestData {
  testCase: string;
  feature: string;
  validSkuNo: string;
  validUpcNo: string;
  validItemDesc: string;
  skuWithPlanogram: string;
  skuWithSalesHistory: string;
  skuWithPromotion: string;
  skuNoPlanogram: string;
  skuNoSalesHistory: string;
  invalidSkuNo: string;
  descKeyword: string;
  descNoMatch: string;
  vendorName: string;
  expectedNotFoundMsg: string;
  expectedEmptyMsg: string;
  expectedVendorMsg: string;
  expectedNoItemsMsg: string;
}

export async function getItemInquiryTestData(): Promise<ItemInquiryTestData[]> {
  return readSheet<ItemInquiryTestData>('Item Inquiry');
}

export interface ArchiveRecordsTestData {
  testCase: string;
  feature: string;
  sampleBarcode: string;
  sampleRecordType: string;
  sampleScannedBy: string;
  totalRecords: string;
  hasRecords: string;
  filterNoMatch: string;
  expectedDeleteMsg: string;
  expectedDeleteConfirm: string;
  expectedDeleteSuccess: string;
  expectedPrintNoSelect: string;
  expectedPrintSuccess: string;
  expectedOfflineError: string;
  expectedHistoryLabel: string;
  expectedArchiveLabel: string;
}

export async function getArchiveRecordsTestData(): Promise<ArchiveRecordsTestData[]> {
  return readSheet<ArchiveRecordsTestData>('ArchiveRecords');
}

export interface ReportsTestData {
  testCase: string;
  feature: string;
  validDeptFrom: string;
  validDeptTo: string;
  invalidDeptHigh: string;
  validPOBeginDate: string;
  validPOEndDate: string;
  validPOFromNo: string;
  validPOToNo: string;
  validDCAreaFrom: string;
  validDCAreaTo: string;
  expectedDeptRangeBeginMsg: string;
  expectedDeptRangeEndMsg: string;
  expectedDeptFromToMsg: string;
  expectedPODateRequiredMsg: string;
  expectedPODateOrderMsg: string;
  expectedPOBeginNumMsg: string;
  expectedPOEndNumMsg: string;
  expectedPONumOrderMsg: string;
  expectedDCAreaOrderMsg: string;
  expectedReprintNoViewSelMsg: string;
  expectedReprintNoPrintSelMsg: string;
  expectedReprintFilenameMsg: string;
  expectedReprintBannerMsg: string;
}

export async function getReportsTestData(): Promise<ReportsTestData[]> {
  return readSheet<ReportsTestData>('Reports');
}

export interface StoreAddressInquiryTestData {
  testCase: string;
  feature: string;
  validStoreNo: string;
  validCity: string;
  validState: string;
  validZip: string;
  validPhone: string;
  validAddress1: string;
  cityStoreNo: string;
  cityName: string;
  cityState: string;
  stateCode: string;
  stateStoreNo: string;
  zipCode: string;
  zipStoreNo: string;
  nonExistentStoreNo: string;
  multiStoreNo: string;
  multiCity: string;
  multiState: string;
  filterKeyword: string;
  enterStoreNo: string;
  storeType: string;
  expectedNoResultsMsg: string;
  expectedEmptyMsg: string;
}

export async function getStoreAddressInquiryTestData(): Promise<StoreAddressInquiryTestData[]> {
  return readSheet<StoreAddressInquiryTestData>('Store Address Inquiry');
}

export interface DirectReplenishmentTestData {
  testCase: string;
  feature: string;
  validLocation: string;
  validLocationValue: string;
  validLocationCategory: string;
  validLocationFrom: string;
  validLocationTo: string;
  validSectionFrom: string;
  validSectionTo: string;
  validShelfIdentifier: string;
  validShelfFrom: string;
  validShelfTo: string;
  validOption: string;
  truckDayLabel: string;
  inventoryDayLabel: string;
  disableTruckOverride: string;
  disableInventoryOverride: string;
  locationDropdownValues: string;
  nonExistentNumber: string;
  transferLocation: string;
  transferLocationFrom: string;
  transferLocationTo: string;
  expectedTruckDayConfirm: string;
  expectedInventoryDayConfirm: string;
  expectedSuccessPrefix: string;
  expectedFailPrefix: string;
  expectedAlreadyCompletedMsg: string;
  expectedPrintError: string;
  expectedReportError: string;
}

export async function getDirectReplenishmentTestData(): Promise<DirectReplenishmentTestData[]> {
  return readSheet<DirectReplenishmentTestData>('DirectReplenishment');
}

// ── Electronic Business Forms ──────────────────────────────────────────────
export interface EBFTestData {
  testCase: string;
  feature: string;
  // Alarm Update Report – Additions/All Current
  aurCallListSeq1: string;
  aurContactName1: string;
  aurJobTitle1: string;
  aurHomePhone1: string;
  aurPasscode1: string;
  aurCallListSeq2: string;
  aurContactName2: string;
  aurJobTitle2: string;
  aurHomePhone2: string;
  aurPasscode2: string;
  // Alarm Update Report – Deletions
  aurDelContactName: string;
  aurDelJobTitle: string;
  aurDelPasscode: string;
  // Cashier Override Worksheet
  cowUPC: string;
  cowSKU: string;
  cowVendorSKU: string;
  cowRetailPrice: string;
  cowItemDesc: string;
  cowCashierInitials: string;
  cowComments: string;
  // Inventory Mgmt Communique
  imcSku: string;
  imcUPC: string;
  imcDesc: string;
  imcComments: string;
  // Config / expected values (sourced from DB)
  mustCallMessage: string;
  alarmUpdateToAddress: string;
  cashierOverrideToAddress: string;
  inventoryMgmtToAddress: string;
}

export async function getEBFTestData(): Promise<EBFTestData[]> {
  return readSheet<EBFTestData>('EBF');
}

// ── Deployment Utilities ───────────────────────────────────────────────────
export interface DeploymentUtilitiesTestData {
  testCase: string;
  feature: string;
  disableRFLockNo: string;
  enableRFLockNo: string;
  timeClockLockNo: string;
  longKeyInput: string;
  expectedLockKeyRequiredText: string;
}

export async function getDeploymentUtilitiesTestData(): Promise<DeploymentUtilitiesTestData[]> {
  return readSheet<DeploymentUtilitiesTestData>('DeploymentUtilities');
}

// ── Intermittent Test Cases ────────────────────────────────────────────────
export interface IntermittentTestCasesTestData {
  testCase: string;
  feature: string;
  poNumber: string;
  sessionPoNumber: string;
  vendorNo: string;
  sku: string;
  qty: string;
  filterValue: string;
  worksheetNoMatchSku: string;
  iaHistSku: string;
  expectedStoreNo: string;
  expectedBadDate: string;
}

export async function getIntermittentTestData(): Promise<IntermittentTestCasesTestData[]> {
  return readSheet<IntermittentTestCasesTestData>('IntermittentTC');
}

// ── Reports (DB-sourced) ───────────────────────────────────────────────────
export interface ReportsSheetData {
  configKey: string;
  configValue: string;
  source: string;
  notes: string;
}

export async function getReportsSheetData(): Promise<ReportsSheetData[]> {
  return readSheet<ReportsSheetData>('Reports');
}

// ── Intermittent Defect Test Cases P2 (DTC028–DTC050) ────────────────────
export interface IntermittentDefectP2TestData {
  testCase: string;
  feature: string;
  wispModernUrl: string;
  disableRFLockNo: string;
  enableRFLockNo: string;
  timeClockLockNo: string;
  validOverstockLocation: string;
  overstockLocationCount: string;
  validPogId: string;
  validPogDesc: string;
  validEventNo: string;
  validDeptFrom: string;
  validDeptTo: string;
  highDeptValue: string;
  activeUserCount: string;
  validStoreNo: string;
  alarmEmail: string;
  expectedLockKeyHeading: string;
  expectedOverstockColHeader: string;
  expectedHighOverstockNavText: string;
  expectedOvItemListNavOld: string;
  expectedOvItemListNavNew: string;
  expectedOverrideDayText: string;
  expectedPogDeactHistTitle: string;
  expectedPlanogramErrIcon: string;
}

export async function getIntermittentDefectP2TestData(): Promise<IntermittentDefectP2TestData[]> {
  return readSheet<IntermittentDefectP2TestData>('IntermittentDefectP2');
}

// ── Intermittent Defect Test Cases P1 (DTC001–DTC027) ────────────────────────
export interface DtcP1TestData {
  testCase: string;
  feature: string;
  sku: string;
  skuDescription: string;
  skuWasPrice: string;
  archiveFinalizedCount: string;
  vendorNo: string;
  vendorName: string;
  rtvId: string;
  rtvVendorNumber: string;
  iaSkuNo: string;
  labelPrintUser: string;
  appUsers: string;
  openPoNumber: string;
  expectedSortAriaPattern: string;
  expectedPaginatorSeparator: string;
  expectedFilterBackground: string;
  expectedAlertHeaderColor: string;
  expectedSectionHeaderColor: string;
  expectedPromoColumnCount: string;
  expectedRwopoGridColumnCount: string;
  listTypeName: string;
}

export async function getDtcP1TestData(): Promise<DtcP1TestData[]> {
  return readSheet<DtcP1TestData>('DtcP1');
}

export interface SanityTestData {
  testCase: string;
  feature: string;
  menuLabel: string;
  expectedTab: string;
  expectedMarker: string;
  dbStoreNo: string;
  dbSkuNo: string;
  dbUpcNo: string;
}

export async function getSanityTestData(): Promise<SanityTestData[]> {
  return readSheet<SanityTestData>('SanityTest');
}

export interface RegressionDbData {
  dataSet: string;
  recordNo: string;
  skuNo: string;
  upcNo: string;
  description: string;
  departmentNo: string;
  storeNo: string;
  storeType: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  username: string;
  fullName: string;
  roleName: string;
}

export async function getRegressionDbData(): Promise<RegressionDbData[]> {
  return readSheet<RegressionDbData>('RegressionDbData');
}
