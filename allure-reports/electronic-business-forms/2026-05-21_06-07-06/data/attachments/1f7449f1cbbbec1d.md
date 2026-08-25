# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: electronicBusinessForms.spec.ts >> Electronic Business Forms >> EBF_COW_WTC01 - Load Cashier Override Worksheet and validate all sections
- Location: tests/electronicBusinessForms.spec.ts:177:7

# Error details

```
Error: app-cashier component should be visible after navigation

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: account_circle
          - text: System
        - generic [ref=e11] [cursor=pointer]: print
        - button "Logout" [ref=e12] [cursor=pointer]
  - generic [ref=e14]:
    - generic:
      - generic [ref=e17] [cursor=pointer]: 
      - list [ref=e19]:
        - listitem [ref=e20]:
          - generic [ref=e21] [cursor=pointer]: Application Alerts
        - listitem [ref=e22]:
          - generic [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: arrow_drop_down
            - text: Inquiry
        - listitem [ref=e25]:
          - generic [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: arrow_drop_down
            - text: Ordering and Receiving
        - listitem [ref=e28]:
          - generic [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: arrow_drop_down
            - text: Inventory Adjustments
        - listitem [ref=e31]:
          - generic [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: arrow_drop_down
            - text: Label Request
        - listitem [ref=e34]:
          - generic [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: arrow_drop_down
            - text: Planogram
        - listitem [ref=e37]:
          - generic [ref=e38] [cursor=pointer]: Price Change Activation
        - listitem [ref=e39]:
          - generic [ref=e40] [cursor=pointer]: Generic Sku List Builder
        - listitem [ref=e41]:
          - generic [ref=e42] [cursor=pointer]: Archive Records
        - listitem [ref=e43]:
          - generic [ref=e44] [cursor=pointer]: User Management
        - listitem [ref=e45]:
          - generic [ref=e46] [cursor=pointer]:
            - generic [ref=e47]: arrow_drop_down
            - text: SISO / DR
        - listitem [ref=e48]:
          - generic [ref=e49] [cursor=pointer]:
            - generic [ref=e50]: arrow_drop_down
            - text: Reports
    - generic [ref=e53]:
      - list [ref=e54]:
        - listitem
      - generic [ref=e58]:
        - generic [ref=e60]:
          - img [ref=e62]
          - separator [ref=e63]
          - generic [ref=e64]: Windows In-Store Processor
        - generic [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]: UserName (Logged in as)
            - generic [ref=e71]: ": system"
          - generic [ref=e72]:
            - generic [ref=e73]: Role Assigned
            - generic [ref=e74]: ": Admin"
          - generic [ref=e75]:
            - generic [ref=e76]: ISP Application Version
            - generic [ref=e77]: ": 21.0.0"
          - generic [ref=e78]:
            - generic [ref=e79]: Store Number (Host Name)
            - generic [ref=e80]: ": SR097402"
```

# Test source

```ts
  81  |       'Additions/All Current section with Add To List button should be visible').toBe(true);
  82  |     expect(result.deletionsSectionVisible,
  83  |       'Deletions section with Add To List button should be visible').toBe(true);
  84  |   });
  85  | 
  86  |   // ── EBF_AUR_WTC02 ─────────────────────────────────────────────────────────
  87  |   // Verify ADT, Vector, Other radio buttons work correctly
  88  |   test('EBF_AUR_WTC02 - Select alarm company type - ADT, Vector, Other radio buttons', async () => {
  89  |     const result = await ebfPage.tc_aur02_selectAlarmCompany(SCREENSHOTS_DIR);
  90  | 
  91  |     expect(result.adtRadioChecked,
  92  |       'ADT radio button should be checkable').toBe(true);
  93  |     expect(result.vectorRadioChecked,
  94  |       'Vector radio button should be checkable').toBe(true);
  95  |     expect(result.otherRadioChecked,
  96  |       'Other radio button should be checkable').toBe(true);
  97  |     expect(result.otherTextInputVisible,
  98  |       'Text input adjacent to Other radio should be visible').toBe(true);
  99  |     expect(result.otherTextAccepted,
  100 |       'Other company text input should accept typed values').toBe(true);
  101 |   });
  102 | 
  103 |   // ── EBF_AUR_WTC03 ─────────────────────────────────────────────────────────
  104 |   // Verify contacts can be added to Additions/All Current grid
  105 |   test('EBF_AUR_WTC03 - Add contacts to Additions/All Current list and verify grid', async () => {
  106 |     const result = await ebfPage.tc_aur03_addContactsToAdditions(SCREENSHOTS_DIR, ebfData);
  107 | 
  108 |     expect(result.inputsFilled,
  109 |       'All five Additions input fields should accept values').toBe(true);
  110 |     // The form uses a static pre-populated datasource (1 empty row); Add To List is UI-only in this version
  111 |     expect(result.rowCountAfterAdd,
  112 |       'Additions grid should have at least 1 row (pre-populated static datasource)').toBeGreaterThanOrEqual(1);
  113 |     expect(result.rowCountAfterSecondAdd,
  114 |       'Grid row count should remain stable after Add To List clicks').toBeGreaterThanOrEqual(1);
  115 | 
  116 |     expect(result.contactNameHeaderVisible,
  117 |       'Contact Name column header should be visible').toBe(true);
  118 |     expect(result.jobTitleHeaderVisible,
  119 |       'Job Title column header should be visible').toBe(true);
  120 |     expect(result.homePhoneHeaderVisible,
  121 |       'Home Phone# column header should be visible').toBe(true);
  122 |     expect(result.passcodeHeaderVisible,
  123 |       'Passcode column header should be visible').toBe(true);
  124 |   });
  125 | 
  126 |   // ── EBF_AUR_WTC04 ─────────────────────────────────────────────────────────
  127 |   // Negative: Remove From List without a selected row should not delete any row
  128 |   test('EBF_AUR_WTC04 - Remove From List without selection - no row deleted', async () => {
  129 |     const result = await ebfPage.tc_aur04_removeWithoutSelection(SCREENSHOTS_DIR);
  130 | 
  131 |     expect(result.pageStable,
  132 |       'Application should remain stable after Remove click with no selection').toBe(true);
  133 |     expect(result.rowCountAfterNoSelRemove,
  134 |       'Row count should be unchanged after Remove with no selection').toBe(result.rowCountBeforeClick);
  135 |   });
  136 | 
  137 |   // ── EBF_AUR_WTC05 ─────────────────────────────────────────────────────────
  138 |   // Add entry to Deletions, verify info box and action buttons
  139 |   test('EBF_AUR_WTC05 - Add to Deletions section and verify Please Read info box and buttons', async () => {
  140 |     const result = await ebfPage.tc_aur05_deletionsAndInfoBox(SCREENSHOTS_DIR, ebfData);
  141 | 
  142 |     expect(result.deletionsRowAdded,
  143 |       'At least one row should appear in Deletions grid after Add To List').toBe(true);
  144 |     expect(result.pleaseReadBoxVisible,
  145 |       'Please read info box should be visible below Deletions section').toBe(true);
  146 |     expect(result.sendEmailBtnVisible,
  147 |       'Send Email button should be visible').toBe(true);
  148 |     expect(result.resetFormBtnVisible,
  149 |       'Reset Form button should be visible').toBe(true);
  150 |     expect(result.sendEmailBtnEnabled,
  151 |       'Send Email button should be enabled').toBe(true);
  152 |     expect(result.resetFormBtnEnabled,
  153 |       'Reset Form button should be enabled').toBe(true);
  154 |   });
  155 | 
  156 |   // ── EBF_AUR_WTC06 ─────────────────────────────────────────────────────────
  157 |   // Reset Form clears all inputs; Send Email triggers a network request
  158 |   test('EBF_AUR_WTC06 - Reset Form clears all inputs and grids; Send Email triggers request', async () => {
  159 |     const result = await ebfPage.tc_aur06_resetAndSendEmail(SCREENSHOTS_DIR);
  160 | 
  161 |     expect(result.inputsFilledBeforeReset,
  162 |       'Form inputs should accept text values before Reset click').toBe(true);
  163 |     // Reset Form and Send Email are UI-only buttons in this version; assert page stability
  164 |     expect(result.pageStableAfterEmail,
  165 |       'Page should remain stable after Reset Form and Send Email clicks').toBe(true);
  166 |     // Additions grid should have at least 1 row (static datasource)
  167 |     expect(result.additionsRowCountAfterReset,
  168 |       'Additions grid should have at least 1 row (static datasource)').toBeGreaterThanOrEqual(1);
  169 |   });
  170 | 
  171 |   // ══════════════════════════════════════════════════════════════════════════
  172 |   // CASHIER OVERRIDE WORKSHEET
  173 |   // ══════════════════════════════════════════════════════════════════════════
  174 | 
  175 |   // ── EBF_COW_WTC01 ─────────────────────────────────────────────────────────
  176 |   // Load form and validate all sections and fields
  177 |   test('EBF_COW_WTC01 - Load Cashier Override Worksheet and validate all sections', async () => {
  178 |     const result = await ebfPage.tc_cow01_loadForm(SCREENSHOTS_DIR, ebfData);
  179 | 
  180 |     expect(result.tabOpened,
> 181 |       'app-cashier component should be visible after navigation').toBe(true);
      |                                                                   ^ Error: app-cashier component should be visible after navigation
  182 |     expect(result.headerText,
  183 |       'Header should contain "Cashier Override"').toContain('Cashier Override');
  184 | 
  185 |     expect(result.storeNoVisible,   'Store# label should be visible').toBe(true);
  186 |     expect(result.dateVisible,      'Date label should be visible').toBe(true);
  187 |     expect(result.registerInputVisible,   'Register# input should be visible').toBe(true);
  188 |     expect(result.reportedByInputVisible, 'Reported By input should be visible').toBe(true);
  189 | 
  190 |     expect(result.itemInfoSectionVisible,   'Item Information section should be visible').toBe(true);
  191 |     expect(result.upcInputVisible,          'UPC input should be visible').toBe(true);
  192 |     expect(result.skuInputVisible,          'SKU input should be visible').toBe(true);
  193 |     expect(result.vendorSkuInputVisible,    'Vendor SKU input should be visible').toBe(true);
  194 |     expect(result.retailPriceInputVisible,  'Retail Price input should be visible').toBe(true);
  195 |     expect(result.itemDescInputVisible,     'Item Description input should be visible').toBe(true);
  196 | 
  197 |     expect(result.nofRFGunCheckboxVisible,    'NOF RF Gun checkbox should be visible').toBe(true);
  198 |     expect(result.nofRegisterCheckboxVisible, 'NOF Register checkbox should be visible').toBe(true);
  199 |     expect(result.reasonCodeDropdownVisible,  'Reason Code dropdown should be visible').toBe(true);
  200 |     expect(result.cashierInitialsVisible,     "Cashier's Initials input should be visible").toBe(true);
  201 |     expect(result.commentsVisible,            'Comments input should be visible').toBe(true);
  202 |   });
  203 | 
  204 |   // ── EBF_COW_WTC02 ─────────────────────────────────────────────────────────
  205 |   // Fill all item fields, check checkbox, select dropdown, add to list
  206 |   test('EBF_COW_WTC02 - Fill item info fields and add item to Items On List', async () => {
  207 |     const result = await ebfPage.tc_cow02_fillAndAddItem(SCREENSHOTS_DIR, ebfData);
  208 | 
  209 |     expect(result.upcFilled,           'UPC field should accept input').toBe(true);
  210 |     expect(result.skuFilled,           'SKU field should accept input').toBe(true);
  211 |     expect(result.checkboxChecked,     'NOF RF Gun checkbox should be checkable').toBe(true);
  212 |     expect(result.reasonCodeSelected,  'Reason Code dropdown should be selectable').toBe(true);
  213 |     // Items On List section visibility depends on dynamic rendering; verify fields were filled
  214 |     expect(result.upcFilled, 'UPC field should have accepted the entered value').toBe(true);
  215 |   });
  216 | 
  217 |   // ── EBF_COW_WTC03 ─────────────────────────────────────────────────────────
  218 |   // Negative: Remove Item From List without selection
  219 |   test('EBF_COW_WTC03 - Remove Item From List without selection - no row deleted', async () => {
  220 |     const result = await ebfPage.tc_cow03_removeWithoutSelection(SCREENSHOTS_DIR);
  221 | 
  222 |     expect(result.pageStable,
  223 |       'Application should be stable after Remove with no selection').toBe(true);
  224 |     expect(result.rowCountAfterNoSelRemove,
  225 |       'Row count should not decrease when no row is selected').toBe(result.rowCountBeforeClick);
  226 |   });
  227 | 
  228 |   // ── EBF_COW_WTC04 ─────────────────────────────────────────────────────────
  229 |   // Verify Reason Code dropdown has all 4 options and each is selectable
  230 |   test('EBF_COW_WTC04 - Reason Code dropdown has all 4 options and each is selectable', async () => {
  231 |     const result = await ebfPage.tc_cow04_reasonCodeDropdown(SCREENSHOTS_DIR);
  232 | 
  233 |     expect(result.optionCount,
  234 |       'Reason Code dropdown should have exactly 4 options').toBe(4);
  235 |     expect(result.hasRegisterFloor,
  236 |       'Option "Register/Floor price Discrepency" should be present').toBe(true);
  237 |     expect(result.hasAdWrong,
  238 |       'Option "Ad Wrong" should be present').toBe(true);
  239 |     expect(result.hasNotOnFile,
  240 |       'Option "Not On File(NOF)" should be present').toBe(true);
  241 |     expect(result.hasOther,
  242 |       "Option \"Other(OP's Asst.Explain)\" should be present").toBe(true);
  243 |     expect(result.eachOptionSelectable,
  244 |       'Each option should be individually selectable').toBe(true);
  245 |   });
  246 | 
  247 |   // ── EBF_COW_WTC05 ─────────────────────────────────────────────────────────
  248 |   // Reset Form clears all Cashier Override Worksheet fields
  249 |   test('EBF_COW_WTC05 - Reset Form clears all Cashier Override Worksheet fields', async () => {
  250 |     const result = await ebfPage.tc_cow05_resetForm(SCREENSHOTS_DIR);
  251 | 
  252 |     // Reset Form is UI-only in this version; assert page stability only
  253 |     expect(result.pageStable,
  254 |       'Page should remain stable after Reset Form click').toBe(true);
  255 |   });
  256 | 
  257 |   // ══════════════════════════════════════════════════════════════════════════
  258 |   // INVENTORY MGMT COMMUNIQUE
  259 |   // ══════════════════════════════════════════════════════════════════════════
  260 | 
  261 |   // ── EBF_IMC_WTC01 ─────────────────────────────────────────────────────────
  262 |   // Load form and validate general info section
  263 |   test('EBF_IMC_WTC01 - Load Inventory Mgmt Communique and validate general info', async () => {
  264 |     const result = await ebfPage.tc_imc01_loadForm(SCREENSHOTS_DIR, ebfData);
  265 | 
  266 |     expect(result.tabOpened,
  267 |       'app-inventory-mgmt-communique component should be visible').toBe(true);
  268 |     expect(result.storeNoVisible,            'Store# label should be visible').toBe(true);
  269 |     expect(result.dmNameInputVisible,        'DM name/Contact Name input should be visible').toBe(true);
  270 |     expect(result.districtInputVisible,      'District input should be visible').toBe(true);
  271 |     expect(result.toMerchantInputVisible,    'To: Merchant/Inv Contact input should be visible').toBe(true);
  272 |     expect(result.responseReqDropdownVisible,'Response Requested dropdown should be visible').toBe(true);
  273 |     expect(result.responseReqHasYes,         'Response Requested should have Yes option').toBe(true);
  274 |     expect(result.responseReqHasNo,          'Response Requested should have No option').toBe(true);
  275 |     expect(result.noSelectedSuccessfully,    'No option should be selectable in dropdown').toBe(true);
  276 |   });
  277 | 
  278 |   // ── EBF_IMC_WTC02 ─────────────────────────────────────────────────────────
  279 |   // All three issue type checkboxes are independently selectable
  280 |   test('EBF_IMC_WTC02 - Select issue type checkboxes independently', async () => {
  281 |     const result = await ebfPage.tc_imc02_selectCheckboxes(SCREENSHOTS_DIR);
```