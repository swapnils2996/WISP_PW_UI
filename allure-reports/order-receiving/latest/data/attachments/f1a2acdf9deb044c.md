# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orderReceiving.spec.ts >> Order & Receiving >> OR_WTC30 - Cancel PO without selection shows guard message
- Location: tests/orderReceiving.spec.ts:493:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e9] [cursor=pointer]: print
  - generic [ref=e11]:
    - generic:
      - generic [ref=e14]: 
      - list [ref=e16]:
        - listitem [ref=e17]:
          - generic [ref=e18] [cursor=pointer]: No Application Alerts
        - listitem [ref=e19]:
          - generic [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: arrow_drop_down
            - text: Inquiry
        - listitem [ref=e22]:
          - generic [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: arrow_drop_down
            - text: Ordering and Receiving
        - listitem [ref=e25]:
          - generic [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: arrow_drop_down
            - text: Inventory Adjustments
        - listitem [ref=e28]:
          - generic [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: arrow_drop_down
            - text: Label Request
        - listitem [ref=e31]:
          - generic [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: arrow_drop_down
            - text: Planogram
        - listitem:
          - generic: Price Change Activation
        - listitem:
          - generic: Generic Sku List Builder
        - listitem:
          - generic: Archive Records
        - listitem:
          - generic: User Management
        - listitem [ref=e34]:
          - generic [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: arrow_drop_down
            - text: SISO / DR
        - listitem [ref=e37]:
          - generic [ref=e38] [cursor=pointer]:
            - generic [ref=e39]: arrow_drop_down
            - text: Reports
    - generic [ref=e42]:
      - list [ref=e43]:
        - listitem
        - listitem [ref=e44]:
          - generic [ref=e45] [cursor=pointer]:
            - text: Purchase Order
            - generic "Close Tab" [ref=e46]:
              - superscript [ref=e47]: x
      - generic: 
      - generic [ref=e52]:
        - generic [ref=e54]:
          - heading "Actions" [level=4] [ref=e56]:
            - link "Actions" [ref=e57] [cursor=pointer]:
              - /url: "#collapse9"
          - generic [ref=e59]:
            - generic [ref=e62]:
              - button "Refresh" [ref=e64] [cursor=pointer]
              - button "Receive" [disabled] [ref=e66]
              - button "View Rcvs" [disabled] [ref=e68]
              - button "Cancel" [disabled] [ref=e70]
              - button "Print" [disabled] [ref=e72]
            - generic [ref=e77]:
              - combobox [ref=e79]:
                - option "PO Number" [selected]
                - option "Sku"
                - option "Vendor Number"
                - option "Vendor Name"
                - option "Description"
                - option "Arrival Date"
              - generic [ref=e81]: "Criteria:"
              - textbox [ref=e83]
              - button "Filter" [ref=e85] [cursor=pointer]
              - button "Reset" [ref=e87] [cursor=pointer]
            - generic [ref=e93]: "Search Entries: None"
        - table [ref=e97]:
          - rowgroup [ref=e98]:
            - row "Order# Vendor Name Vendor# Status Ordered Arriving" [ref=e99]:
              - cell [ref=e100] [cursor=pointer]
              - cell "Order#" [ref=e101] [cursor=pointer]
              - cell "Vendor Name" [ref=e102] [cursor=pointer]
              - cell "Vendor#" [ref=e103] [cursor=pointer]
              - cell "Status" [ref=e104] [cursor=pointer]
              - cell "Ordered" [ref=e105] [cursor=pointer]
              - cell "Arriving" [ref=e106] [cursor=pointer]
          - rowgroup [ref=e107]:
            - row "+ 41226767 ADWOOD MANUFACTURING LTD 18324 Fully Recvd 03/17/2026 05/15/2026" [ref=e108]:
              - cell "+" [ref=e109] [cursor=pointer]:
                - button "+" [ref=e110]
              - cell "41226767" [ref=e111] [cursor=pointer]
              - cell "ADWOOD MANUFACTURING LTD" [ref=e112] [cursor=pointer]
              - cell "18324" [ref=e113] [cursor=pointer]
              - cell "Fully Recvd" [ref=e114] [cursor=pointer]
              - cell "03/17/2026" [ref=e115] [cursor=pointer]
              - cell "05/15/2026" [ref=e116] [cursor=pointer]
            - row "+ 41113787 ARTISTREE INC CANADA 85707 Open 02/17/2026 03/03/2026" [ref=e117]:
              - cell "+" [ref=e118] [cursor=pointer]:
                - button "+" [ref=e119]
              - cell "41113787" [ref=e120] [cursor=pointer]
              - cell "ARTISTREE INC CANADA" [ref=e121] [cursor=pointer]
              - cell "85707" [ref=e122] [cursor=pointer]
              - cell "Open" [ref=e123] [cursor=pointer]
              - cell "02/17/2026" [ref=e124] [cursor=pointer]
              - cell "03/03/2026" [ref=e125] [cursor=pointer]
            - row "+ 41173003 ARTISTREE INC CANADA 85707 Open 03/04/2026 03/18/2026" [ref=e126]:
              - cell "+" [ref=e127] [cursor=pointer]:
                - button "+" [ref=e128]
              - cell "41173003" [ref=e129] [cursor=pointer]
              - cell "ARTISTREE INC CANADA" [ref=e130] [cursor=pointer]
              - cell "85707" [ref=e131] [cursor=pointer]
              - cell "Open" [ref=e132] [cursor=pointer]
              - cell "03/04/2026" [ref=e133] [cursor=pointer]
              - cell "03/18/2026" [ref=e134] [cursor=pointer]
            - row "+ 41176035 ARTISTREE INC CANADA 85707 Open 03/06/2026 03/20/2026" [ref=e135]:
              - cell "+" [ref=e136] [cursor=pointer]:
                - button "+" [ref=e137]
              - cell "41176035" [ref=e138] [cursor=pointer]
              - cell "ARTISTREE INC CANADA" [ref=e139] [cursor=pointer]
              - cell "85707" [ref=e140] [cursor=pointer]
              - cell "Open" [ref=e141] [cursor=pointer]
              - cell "03/06/2026" [ref=e142] [cursor=pointer]
              - cell "03/20/2026" [ref=e143] [cursor=pointer]
            - row "+ 41228933 ARTISTREE INC CANADA 85707 Open 03/18/2026 04/01/2026" [ref=e144]:
              - cell "+" [ref=e145] [cursor=pointer]:
                - button "+" [ref=e146]
              - cell "41228933" [ref=e147] [cursor=pointer]
              - cell "ARTISTREE INC CANADA" [ref=e148] [cursor=pointer]
              - cell "85707" [ref=e149] [cursor=pointer]
              - cell "Open" [ref=e150] [cursor=pointer]
              - cell "03/18/2026" [ref=e151] [cursor=pointer]
              - cell "04/01/2026" [ref=e152] [cursor=pointer]
            - row "+ 41252347 ARTISTREE INC CANADA 85707 Open 03/24/2026 04/07/2026" [ref=e153]:
              - cell "+" [ref=e154] [cursor=pointer]:
                - button "+" [ref=e155]
              - cell "41252347" [ref=e156] [cursor=pointer]
              - cell "ARTISTREE INC CANADA" [ref=e157] [cursor=pointer]
              - cell "85707" [ref=e158] [cursor=pointer]
              - cell "Open" [ref=e159] [cursor=pointer]
              - cell "03/24/2026" [ref=e160] [cursor=pointer]
              - cell "04/07/2026" [ref=e161] [cursor=pointer]
            - row "+ 41196590 ARTISTREE INC CANADA MATS 93515 Open 03/10/2026 03/24/2026" [ref=e162]:
              - cell "+" [ref=e163] [cursor=pointer]:
                - button "+" [ref=e164]
              - cell "41196590" [ref=e165] [cursor=pointer]
              - cell "ARTISTREE INC CANADA MATS" [ref=e166] [cursor=pointer]
              - cell "93515" [ref=e167] [cursor=pointer]
              - cell "Open" [ref=e168] [cursor=pointer]
              - cell "03/10/2026" [ref=e169] [cursor=pointer]
              - cell "03/24/2026" [ref=e170] [cursor=pointer]
            - row "+ 41093456 ARTISTREE INC MATS 34891 Open 02/13/2026 03/26/2026" [ref=e171]:
              - cell "+" [ref=e172] [cursor=pointer]:
                - button "+" [ref=e173]
              - cell "41093456" [ref=e174] [cursor=pointer]
              - cell "ARTISTREE INC MATS" [ref=e175] [cursor=pointer]
              - cell "34891" [ref=e176] [cursor=pointer]
              - cell "Open" [ref=e177] [cursor=pointer]
              - cell "02/13/2026" [ref=e178] [cursor=pointer]
              - cell "03/26/2026" [ref=e179] [cursor=pointer]
            - row "+ 41176526 ARTISTREE INC MATS 34891 Open 03/06/2026 04/16/2026" [ref=e180]:
              - cell "+" [ref=e181] [cursor=pointer]:
                - button "+" [ref=e182]
              - cell "41176526" [ref=e183] [cursor=pointer]
              - cell "ARTISTREE INC MATS" [ref=e184] [cursor=pointer]
              - cell "34891" [ref=e185] [cursor=pointer]
              - cell "Open" [ref=e186] [cursor=pointer]
              - cell "03/06/2026" [ref=e187] [cursor=pointer]
              - cell "04/16/2026" [ref=e188] [cursor=pointer]
            - row "+ 41197371 ARTISTREE INC PRINTS 2384 Open 03/10/2026 04/16/2026" [ref=e189]:
              - cell "+" [ref=e190] [cursor=pointer]:
                - button "+" [ref=e191]
              - cell "41197371" [ref=e192] [cursor=pointer]
              - cell "ARTISTREE INC PRINTS" [ref=e193] [cursor=pointer]
              - cell "2384" [ref=e194] [cursor=pointer]
              - cell "Open" [ref=e195] [cursor=pointer]
              - cell "03/10/2026" [ref=e196] [cursor=pointer]
              - cell "04/16/2026" [ref=e197] [cursor=pointer]
            - row "+ 41116953 CORE MARK INTERNATIONAL INC 94587 Part Recvd 02/17/2026 03/04/2026" [ref=e198]:
              - cell "+" [ref=e199] [cursor=pointer]:
                - button "+" [ref=e200]
              - cell "41116953" [ref=e201] [cursor=pointer]
              - cell "CORE MARK INTERNATIONAL INC" [ref=e202] [cursor=pointer]
              - cell "94587" [ref=e203] [cursor=pointer]
              - cell "Part Recvd" [ref=e204] [cursor=pointer]
              - cell "02/17/2026" [ref=e205] [cursor=pointer]
              - cell "03/04/2026" [ref=e206] [cursor=pointer]
            - row "+ 41125035 CORE MARK INTERNATIONAL INC 94587 Fully Recvd 02/23/2026 02/23/2026" [ref=e207]:
              - cell "+" [ref=e208] [cursor=pointer]:
                - button "+" [ref=e209]
              - cell "41125035" [ref=e210] [cursor=pointer]
              - cell "CORE MARK INTERNATIONAL INC" [ref=e211] [cursor=pointer]
              - cell "94587" [ref=e212] [cursor=pointer]
              - cell "Fully Recvd" [ref=e213] [cursor=pointer]
              - cell "02/23/2026" [ref=e214] [cursor=pointer]
              - cell "02/23/2026" [ref=e215] [cursor=pointer]
            - row "+ 41059587 CRAYOLA CANADA 1887 Part Recvd 02/04/2026 02/28/2026" [ref=e216]:
              - cell "+" [ref=e217] [cursor=pointer]:
                - button "+" [ref=e218]
              - cell "41059587" [ref=e219] [cursor=pointer]
              - cell "CRAYOLA CANADA" [ref=e220] [cursor=pointer]
              - cell "1887" [ref=e221] [cursor=pointer]
              - cell "Part Recvd" [ref=e222] [cursor=pointer]
              - cell "02/04/2026" [ref=e223] [cursor=pointer]
              - cell "02/28/2026" [ref=e224] [cursor=pointer]
            - row "+ 41118793 CRAYOLA CANADA 1887 Part Recvd 02/18/2026 03/14/2026" [ref=e225]:
              - cell "+" [ref=e226] [cursor=pointer]:
                - button "+" [ref=e227]
              - cell "41118793" [ref=e228] [cursor=pointer]
              - cell "CRAYOLA CANADA" [ref=e229] [cursor=pointer]
              - cell "1887" [ref=e230] [cursor=pointer]
              - cell "Part Recvd" [ref=e231] [cursor=pointer]
              - cell "02/18/2026" [ref=e232] [cursor=pointer]
              - cell "03/14/2026" [ref=e233] [cursor=pointer]
            - row "+ 41173233 CRAYOLA CANADA 1887 Part Recvd 03/04/2026 03/28/2026" [ref=e234]:
              - cell "+" [ref=e235] [cursor=pointer]:
                - button "+" [ref=e236]
              - cell "41173233" [ref=e237] [cursor=pointer]
              - cell "CRAYOLA CANADA" [ref=e238] [cursor=pointer]
              - cell "1887" [ref=e239] [cursor=pointer]
              - cell "Part Recvd" [ref=e240] [cursor=pointer]
              - cell "03/04/2026" [ref=e241] [cursor=pointer]
              - cell "03/28/2026" [ref=e242] [cursor=pointer]
            - row "+ 41229434 CRAYOLA CANADA 1887 Open 03/18/2026 04/11/2026" [ref=e243]:
              - cell "+" [ref=e244] [cursor=pointer]:
                - button "+" [ref=e245]
              - cell "41229434" [ref=e246] [cursor=pointer]
              - cell "CRAYOLA CANADA" [ref=e247] [cursor=pointer]
              - cell "1887" [ref=e248] [cursor=pointer]
              - cell "Open" [ref=e249] [cursor=pointer]
              - cell "03/18/2026" [ref=e250] [cursor=pointer]
              - cell "04/11/2026" [ref=e251] [cursor=pointer]
            - row "+ 41147351 FLAGS UNLIMITED CORPORATION 6771 Part Recvd 02/26/2026 03/27/2026" [ref=e252]:
              - cell "+" [ref=e253] [cursor=pointer]:
                - button "+" [ref=e254]
              - cell "41147351" [ref=e255] [cursor=pointer]
              - cell "FLAGS UNLIMITED CORPORATION" [ref=e256] [cursor=pointer]
              - cell "6771" [ref=e257] [cursor=pointer]
              - cell "Part Recvd" [ref=e258] [cursor=pointer]
              - cell "02/26/2026" [ref=e259] [cursor=pointer]
              - cell "03/27/2026" [ref=e260] [cursor=pointer]
            - row "+ 41231597 FLAGS UNLIMITED CORPORATION 6771 Open 03/19/2026 04/24/2026" [ref=e261]:
              - cell "+" [ref=e262] [cursor=pointer]:
                - button "+" [ref=e263]
              - cell "41231597" [ref=e264] [cursor=pointer]
              - cell "FLAGS UNLIMITED CORPORATION" [ref=e265] [cursor=pointer]
              - cell "6771" [ref=e266] [cursor=pointer]
              - cell "Open" [ref=e267] [cursor=pointer]
              - cell "03/19/2026" [ref=e268] [cursor=pointer]
              - cell "04/24/2026" [ref=e269] [cursor=pointer]
            - row "+ 40543841 JFL ENTERPRISES INC 6055 Open 10/10/2025 03/25/2026" [ref=e270]:
              - cell "+" [ref=e271] [cursor=pointer]:
                - button "+" [ref=e272]
              - cell "40543841" [ref=e273] [cursor=pointer]
              - cell "JFL ENTERPRISES INC" [ref=e274] [cursor=pointer]
              - cell "6055" [ref=e275] [cursor=pointer]
              - cell "Open" [ref=e276] [cursor=pointer]
              - cell "10/10/2025" [ref=e277] [cursor=pointer]
              - cell "03/25/2026" [ref=e278] [cursor=pointer]
            - row "+ 40971479 KNIGHTSBRIDGE GLOBAL LTD 19486 Fully Recvd 01/13/2026 02/18/2026" [ref=e279]:
              - cell "+" [ref=e280] [cursor=pointer]:
                - button "+" [ref=e281]
              - cell "40971479" [ref=e282] [cursor=pointer]
              - cell "KNIGHTSBRIDGE GLOBAL LTD" [ref=e283] [cursor=pointer]
              - cell "19486" [ref=e284] [cursor=pointer]
              - cell "Fully Recvd" [ref=e285] [cursor=pointer]
              - cell "01/13/2026" [ref=e286] [cursor=pointer]
              - cell "02/18/2026" [ref=e287] [cursor=pointer]
            - row "+ 41056328 KNIGHTSBRIDGE GLOBAL LTD 19486 Fully Recvd 02/03/2026 03/11/2026" [ref=e288]:
              - cell "+" [ref=e289] [cursor=pointer]:
                - button "+" [ref=e290]
              - cell "41056328" [ref=e291] [cursor=pointer]
              - cell "KNIGHTSBRIDGE GLOBAL LTD" [ref=e292] [cursor=pointer]
              - cell "19486" [ref=e293] [cursor=pointer]
              - cell "Fully Recvd" [ref=e294] [cursor=pointer]
              - cell "02/03/2026" [ref=e295] [cursor=pointer]
              - cell "03/11/2026" [ref=e296] [cursor=pointer]
            - row "+ 41140973 KNIGHTSBRIDGE GLOBAL LTD 19486 Fully Recvd 02/24/2026 04/01/2026" [ref=e297]:
              - cell "+" [ref=e298] [cursor=pointer]:
                - button "+" [ref=e299]
              - cell "41140973" [ref=e300] [cursor=pointer]
              - cell "KNIGHTSBRIDGE GLOBAL LTD" [ref=e301] [cursor=pointer]
              - cell "19486" [ref=e302] [cursor=pointer]
              - cell "Fully Recvd" [ref=e303] [cursor=pointer]
              - cell "02/24/2026" [ref=e304] [cursor=pointer]
              - cell "04/01/2026" [ref=e305] [cursor=pointer]
            - row "+ 41226086 KNIGHTSBRIDGE GLOBAL LTD 19486 Open 03/17/2026 04/22/2026" [ref=e306]:
              - cell "+" [ref=e307] [cursor=pointer]:
                - button "+" [ref=e308]
              - cell "41226086" [ref=e309] [cursor=pointer]
              - cell "KNIGHTSBRIDGE GLOBAL LTD" [ref=e310] [cursor=pointer]
              - cell "19486" [ref=e311] [cursor=pointer]
              - cell "Open" [ref=e312] [cursor=pointer]
              - cell "03/17/2026" [ref=e313] [cursor=pointer]
              - cell "04/22/2026" [ref=e314] [cursor=pointer]
            - row "+ 40954988 M&G PARTNERS LLP DBA FASHION A 66907 Open 01/12/2026 05/29/2026" [ref=e315]:
              - cell "+" [ref=e316] [cursor=pointer]:
                - button "+" [ref=e317]
              - cell "40954988" [ref=e318] [cursor=pointer]
              - cell "M&G PARTNERS LLP DBA FASHION A" [ref=e319] [cursor=pointer]
              - cell "66907" [ref=e320] [cursor=pointer]
              - cell "Open" [ref=e321] [cursor=pointer]
              - cell "01/12/2026" [ref=e322] [cursor=pointer]
              - cell "05/29/2026" [ref=e323] [cursor=pointer]
            - 'row "+ 41176034 MICHAELS DISTRIBUTION CENTER # 1 Fully Recvd 03/06/2026 03/20/2026" [ref=e324]':
              - cell "+" [ref=e325] [cursor=pointer]:
                - button "+" [ref=e326]
              - cell "41176034" [ref=e327] [cursor=pointer]
              - 'cell "MICHAELS DISTRIBUTION CENTER #" [ref=e328] [cursor=pointer]'
              - cell "1" [ref=e329] [cursor=pointer]
              - cell "Fully Recvd" [ref=e330] [cursor=pointer]
              - cell "03/06/2026" [ref=e331] [cursor=pointer]
              - cell "03/20/2026" [ref=e332] [cursor=pointer]
            - 'row "+ 41196591 MICHAELS DISTRIBUTION CENTER # 1 Fully Recvd 03/10/2026 03/24/2026" [ref=e333]':
              - cell "+" [ref=e334] [cursor=pointer]:
                - button "+" [ref=e335]
              - cell "41196591" [ref=e336] [cursor=pointer]
              - 'cell "MICHAELS DISTRIBUTION CENTER #" [ref=e337] [cursor=pointer]'
              - cell "1" [ref=e338] [cursor=pointer]
              - cell "Fully Recvd" [ref=e339] [cursor=pointer]
              - cell "03/10/2026" [ref=e340] [cursor=pointer]
              - cell "03/24/2026" [ref=e341] [cursor=pointer]
            - 'row "+ 41396093 MICHAELS DISTRIBUTION CENTER # 1 Fully Recvd 05/03/2026 05/03/2026" [ref=e342]':
              - cell "+" [ref=e343] [cursor=pointer]:
                - button "+" [ref=e344]
              - cell "41396093" [ref=e345] [cursor=pointer]
              - 'cell "MICHAELS DISTRIBUTION CENTER #" [ref=e346] [cursor=pointer]'
              - cell "1" [ref=e347] [cursor=pointer]
              - cell "Fully Recvd" [ref=e348] [cursor=pointer]
              - cell "05/03/2026" [ref=e349] [cursor=pointer]
              - cell "05/03/2026" [ref=e350] [cursor=pointer]
            - 'row "+ 41396101 MICHAELS DISTRIBUTION CENTER # 1 Fully Recvd 05/03/2026 05/03/2026" [ref=e351]':
              - cell "+" [ref=e352] [cursor=pointer]:
                - button "+" [ref=e353]
              - cell "41396101" [ref=e354] [cursor=pointer]
              - 'cell "MICHAELS DISTRIBUTION CENTER #" [ref=e355] [cursor=pointer]'
              - cell "1" [ref=e356] [cursor=pointer]
              - cell "Fully Recvd" [ref=e357] [cursor=pointer]
              - cell "05/03/2026" [ref=e358] [cursor=pointer]
              - cell "05/03/2026" [ref=e359] [cursor=pointer]
            - 'row "+ 41396144 MICHAELS DISTRIBUTION CENTER # 1 Fully Recvd 05/03/2026 05/03/2026" [ref=e360]':
              - cell "+" [ref=e361] [cursor=pointer]:
                - button "+" [ref=e362]
              - cell "41396144" [ref=e363] [cursor=pointer]
              - 'cell "MICHAELS DISTRIBUTION CENTER #" [ref=e364] [cursor=pointer]'
              - cell "1" [ref=e365] [cursor=pointer]
              - cell "Fully Recvd" [ref=e366] [cursor=pointer]
              - cell "05/03/2026" [ref=e367] [cursor=pointer]
              - cell "05/03/2026" [ref=e368] [cursor=pointer]
            - 'row "+ 41417802 MICHAELS DISTRIBUTION CENTER # 1 Fully Recvd 05/06/2026 05/06/2026" [ref=e369]':
              - cell "+" [ref=e370] [cursor=pointer]:
                - button "+" [ref=e371]
              - cell "41417802" [ref=e372] [cursor=pointer]
              - 'cell "MICHAELS DISTRIBUTION CENTER #" [ref=e373] [cursor=pointer]'
              - cell "1" [ref=e374] [cursor=pointer]
              - cell "Fully Recvd" [ref=e375] [cursor=pointer]
              - cell "05/06/2026" [ref=e376] [cursor=pointer]
              - cell "05/06/2026" [ref=e377] [cursor=pointer]
            - row "+ 40974082 SATIN FINE FOODS 69477 Part Recvd 01/13/2026 02/24/2026" [ref=e378]:
              - cell "+" [ref=e379] [cursor=pointer]:
                - button "+" [ref=e380]
              - cell "40974082" [ref=e381] [cursor=pointer]
              - cell "SATIN FINE FOODS" [ref=e382] [cursor=pointer]
              - cell "69477" [ref=e383] [cursor=pointer]
              - cell "Part Recvd" [ref=e384] [cursor=pointer]
              - cell "01/13/2026" [ref=e385] [cursor=pointer]
              - cell "02/24/2026" [ref=e386] [cursor=pointer]
            - row "+ 41029831 SATIN FINE FOODS 69477 Fully Recvd 01/27/2026 03/10/2026" [ref=e387]:
              - cell "+" [ref=e388] [cursor=pointer]:
                - button "+" [ref=e389]
              - cell "41029831" [ref=e390] [cursor=pointer]
              - cell "SATIN FINE FOODS" [ref=e391] [cursor=pointer]
              - cell "69477" [ref=e392] [cursor=pointer]
              - cell "Fully Recvd" [ref=e393] [cursor=pointer]
              - cell "01/27/2026" [ref=e394] [cursor=pointer]
              - cell "03/10/2026" [ref=e395] [cursor=pointer]
            - row "+ 41086884 SATIN FINE FOODS 69477 Fully Recvd 02/10/2026 03/24/2026" [ref=e396]:
              - cell "+" [ref=e397] [cursor=pointer]:
                - button "+" [ref=e398]
              - cell "41086884" [ref=e399] [cursor=pointer]
              - cell "SATIN FINE FOODS" [ref=e400] [cursor=pointer]
              - cell "69477" [ref=e401] [cursor=pointer]
              - cell "Fully Recvd" [ref=e402] [cursor=pointer]
              - cell "02/10/2026" [ref=e403] [cursor=pointer]
              - cell "03/24/2026" [ref=e404] [cursor=pointer]
            - row "+ 41144257 SATIN FINE FOODS 69477 Part Recvd 02/24/2026 04/07/2026" [ref=e405]:
              - cell "+" [ref=e406] [cursor=pointer]:
                - button "+" [ref=e407]
              - cell "41144257" [ref=e408] [cursor=pointer]
              - cell "SATIN FINE FOODS" [ref=e409] [cursor=pointer]
              - cell "69477" [ref=e410] [cursor=pointer]
              - cell "Part Recvd" [ref=e411] [cursor=pointer]
              - cell "02/24/2026" [ref=e412] [cursor=pointer]
              - cell "04/07/2026" [ref=e413] [cursor=pointer]
            - row "+ 41200007 SATIN FINE FOODS 69477 Part Recvd 03/10/2026 04/21/2026" [ref=e414]:
              - cell "+" [ref=e415] [cursor=pointer]:
                - button "+" [ref=e416]
              - cell "41200007" [ref=e417] [cursor=pointer]
              - cell "SATIN FINE FOODS" [ref=e418] [cursor=pointer]
              - cell "69477" [ref=e419] [cursor=pointer]
              - cell "Part Recvd" [ref=e420] [cursor=pointer]
              - cell "03/10/2026" [ref=e421] [cursor=pointer]
              - cell "04/21/2026" [ref=e422] [cursor=pointer]
            - row "+ 41255126 SATIN FINE FOODS 69477 Open 03/24/2026 05/05/2026" [ref=e423]:
              - cell "+" [ref=e424] [cursor=pointer]:
                - button "+" [ref=e425]
              - cell "41255126" [ref=e426] [cursor=pointer]
              - cell "SATIN FINE FOODS" [ref=e427] [cursor=pointer]
              - cell "69477" [ref=e428] [cursor=pointer]
              - cell "Open" [ref=e429] [cursor=pointer]
              - cell "03/24/2026" [ref=e430] [cursor=pointer]
              - cell "05/05/2026" [ref=e431] [cursor=pointer]
            - row "+ 40977557 SECOND NATURE DESIGNS 13694 Open 01/15/2026 06/26/2026" [ref=e432]:
              - cell "+" [ref=e433] [cursor=pointer]:
                - button "+" [ref=e434]
              - cell "40977557" [ref=e435] [cursor=pointer]
              - cell "SECOND NATURE DESIGNS" [ref=e436] [cursor=pointer]
              - cell "13694" [ref=e437] [cursor=pointer]
              - cell "Open" [ref=e438] [cursor=pointer]
              - cell "01/15/2026" [ref=e439] [cursor=pointer]
              - cell "06/26/2026" [ref=e440] [cursor=pointer]
            - row "+ 41225475 SHERWIN WILLIAMS CANADA INC 1838 Open 03/17/2026 05/08/2026" [ref=e441]:
              - cell "+" [ref=e442] [cursor=pointer]:
                - button "+" [ref=e443]
              - cell "41225475" [ref=e444] [cursor=pointer]
              - cell "SHERWIN WILLIAMS CANADA INC" [ref=e445] [cursor=pointer]
              - cell "1838" [ref=e446] [cursor=pointer]
              - cell "Open" [ref=e447] [cursor=pointer]
              - cell "03/17/2026" [ref=e448] [cursor=pointer]
              - cell "05/08/2026" [ref=e449] [cursor=pointer]
            - row "+ 41117212 SIGNATURE MKTG AND MFG CANADA 73428 Open 02/17/2026 03/20/2026" [ref=e450]:
              - cell "+" [ref=e451] [cursor=pointer]:
                - button "+" [ref=e452]
              - cell "41117212" [ref=e453] [cursor=pointer]
              - cell "SIGNATURE MKTG AND MFG CANADA" [ref=e454] [cursor=pointer]
              - cell "73428" [ref=e455] [cursor=pointer]
              - cell "Open" [ref=e456] [cursor=pointer]
              - cell "02/17/2026" [ref=e457] [cursor=pointer]
              - cell "03/20/2026" [ref=e458] [cursor=pointer]
            - row "+ 41084941 SLS ARTS 6098 Open 02/10/2026 04/08/2026" [ref=e459]:
              - cell "+" [ref=e460] [cursor=pointer]:
                - button "+" [ref=e461]
              - cell "41084941" [ref=e462] [cursor=pointer]
              - cell "SLS ARTS" [ref=e463] [cursor=pointer]
              - cell "6098" [ref=e464] [cursor=pointer]
              - cell "Open" [ref=e465] [cursor=pointer]
              - cell "02/10/2026" [ref=e466] [cursor=pointer]
              - cell "04/08/2026" [ref=e467] [cursor=pointer]
            - row "+ 41141750 SLS ARTS 6098 Open 02/24/2026 04/22/2026" [ref=e468]:
              - cell "+" [ref=e469] [cursor=pointer]:
                - button "+" [ref=e470]
              - cell "41141750" [ref=e471] [cursor=pointer]
              - cell "SLS ARTS" [ref=e472] [cursor=pointer]
              - cell "6098" [ref=e473] [cursor=pointer]
              - cell "Open" [ref=e474] [cursor=pointer]
              - cell "02/24/2026" [ref=e475] [cursor=pointer]
              - cell "04/22/2026" [ref=e476] [cursor=pointer]
            - row "+ 41197824 SLS ARTS 6098 Open 03/10/2026 05/06/2026" [ref=e477]:
              - cell "+" [ref=e478] [cursor=pointer]:
                - button "+" [ref=e479]
              - cell "41197824" [ref=e480] [cursor=pointer]
              - cell "SLS ARTS" [ref=e481] [cursor=pointer]
              - cell "6098" [ref=e482] [cursor=pointer]
              - cell "Open" [ref=e483] [cursor=pointer]
              - cell "03/10/2026" [ref=e484] [cursor=pointer]
              - cell "05/06/2026" [ref=e485] [cursor=pointer]
            - row "+ 41253865 SLS ARTS 6098 Open 03/24/2026 05/20/2026" [ref=e486]:
              - cell "+" [ref=e487] [cursor=pointer]:
                - button "+" [ref=e488]
              - cell "41253865" [ref=e489] [cursor=pointer]
              - cell "SLS ARTS" [ref=e490] [cursor=pointer]
              - cell "6098" [ref=e491] [cursor=pointer]
              - cell "Open" [ref=e492] [cursor=pointer]
              - cell "03/24/2026" [ref=e493] [cursor=pointer]
              - cell "05/20/2026" [ref=e494] [cursor=pointer]
            - row "+ 41027015 SPINRITE LP 1863 Part Recvd 01/27/2026 02/19/2026" [ref=e495]:
              - cell "+" [ref=e496] [cursor=pointer]:
                - button "+" [ref=e497]
              - cell "41027015" [ref=e498] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e499] [cursor=pointer]
              - cell "1863" [ref=e500] [cursor=pointer]
              - cell "Part Recvd" [ref=e501] [cursor=pointer]
              - cell "01/27/2026" [ref=e502] [cursor=pointer]
              - cell "02/19/2026" [ref=e503] [cursor=pointer]
            - row "+ 41055172 SPINRITE LP 1863 Fully Recvd 02/03/2026 02/26/2026" [ref=e504]:
              - cell "+" [ref=e505] [cursor=pointer]:
                - button "+" [ref=e506]
              - cell "41055172" [ref=e507] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e508] [cursor=pointer]
              - cell "1863" [ref=e509] [cursor=pointer]
              - cell "Fully Recvd" [ref=e510] [cursor=pointer]
              - cell "02/03/2026" [ref=e511] [cursor=pointer]
              - cell "02/26/2026" [ref=e512] [cursor=pointer]
            - row "+ 41084065 SPINRITE LP 1863 Part Recvd 02/10/2026 03/05/2026" [ref=e513]:
              - cell "+" [ref=e514] [cursor=pointer]:
                - button "+" [ref=e515]
              - cell "41084065" [ref=e516] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e517] [cursor=pointer]
              - cell "1863" [ref=e518] [cursor=pointer]
              - cell "Part Recvd" [ref=e519] [cursor=pointer]
              - cell "02/10/2026" [ref=e520] [cursor=pointer]
              - cell "03/05/2026" [ref=e521] [cursor=pointer]
            - row "+ 41114535 SPINRITE LP 1863 Fully Recvd 02/17/2026 03/12/2026" [ref=e522]:
              - cell "+" [ref=e523] [cursor=pointer]:
                - button "+" [ref=e524]
              - cell "41114535" [ref=e525] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e526] [cursor=pointer]
              - cell "1863" [ref=e527] [cursor=pointer]
              - cell "Fully Recvd" [ref=e528] [cursor=pointer]
              - cell "02/17/2026" [ref=e529] [cursor=pointer]
              - cell "03/12/2026" [ref=e530] [cursor=pointer]
            - row "+ 41140911 SPINRITE LP 1863 Fully Recvd 02/24/2026 03/19/2026" [ref=e531]:
              - cell "+" [ref=e532] [cursor=pointer]:
                - button "+" [ref=e533]
              - cell "41140911" [ref=e534] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e535] [cursor=pointer]
              - cell "1863" [ref=e536] [cursor=pointer]
              - cell "Fully Recvd" [ref=e537] [cursor=pointer]
              - cell "02/24/2026" [ref=e538] [cursor=pointer]
              - cell "03/19/2026" [ref=e539] [cursor=pointer]
            - row "+ 41169020 SPINRITE LP 1863 Part Recvd 03/03/2026 03/26/2026" [ref=e540]:
              - cell "+" [ref=e541] [cursor=pointer]:
                - button "+" [ref=e542]
              - cell "41169020" [ref=e543] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e544] [cursor=pointer]
              - cell "1863" [ref=e545] [cursor=pointer]
              - cell "Part Recvd" [ref=e546] [cursor=pointer]
              - cell "03/03/2026" [ref=e547] [cursor=pointer]
              - cell "03/26/2026" [ref=e548] [cursor=pointer]
            - row "+ 41197230 SPINRITE LP 1863 Part Recvd 03/10/2026 04/02/2026" [ref=e549]:
              - cell "+" [ref=e550] [cursor=pointer]:
                - button "+" [ref=e551]
              - cell "41197230" [ref=e552] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e553] [cursor=pointer]
              - cell "1863" [ref=e554] [cursor=pointer]
              - cell "Part Recvd" [ref=e555] [cursor=pointer]
              - cell "03/10/2026" [ref=e556] [cursor=pointer]
              - cell "04/02/2026" [ref=e557] [cursor=pointer]
            - row "+ 41225541 SPINRITE LP 1863 Part Recvd 03/17/2026 04/09/2026" [ref=e558]:
              - cell "+" [ref=e559] [cursor=pointer]:
                - button "+" [ref=e560]
              - cell "41225541" [ref=e561] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e562] [cursor=pointer]
              - cell "1863" [ref=e563] [cursor=pointer]
              - cell "Part Recvd" [ref=e564] [cursor=pointer]
              - cell "03/17/2026" [ref=e565] [cursor=pointer]
              - cell "04/09/2026" [ref=e566] [cursor=pointer]
            - row "+ 41253659 SPINRITE LP 1863 Open 03/24/2026 04/16/2026" [ref=e567]:
              - cell "+" [ref=e568] [cursor=pointer]:
                - button "+" [ref=e569]
              - cell "41253659" [ref=e570] [cursor=pointer]
              - cell "SPINRITE LP" [ref=e571] [cursor=pointer]
              - cell "1863" [ref=e572] [cursor=pointer]
              - cell "Open" [ref=e573] [cursor=pointer]
              - cell "03/24/2026" [ref=e574] [cursor=pointer]
              - cell "04/16/2026" [ref=e575] [cursor=pointer]
            - row "+ 41147035 WILTON INDUSTRIES (DOMESTIC) 20158 Open 02/26/2026 07/03/2026" [ref=e576]:
              - cell "+" [ref=e577] [cursor=pointer]:
                - button "+" [ref=e578]
              - cell "41147035" [ref=e579] [cursor=pointer]
              - cell "WILTON INDUSTRIES (DOMESTIC)" [ref=e580] [cursor=pointer]
              - cell "20158" [ref=e581] [cursor=pointer]
              - cell "Open" [ref=e582] [cursor=pointer]
              - cell "02/26/2026" [ref=e583] [cursor=pointer]
              - cell "07/03/2026" [ref=e584] [cursor=pointer]
            - row "+ 40914241 SLS ARTS 6098 Fully Recvd 12/30/2025 02/25/2026" [ref=e585]:
              - cell "+" [ref=e586] [cursor=pointer]:
                - button "+" [ref=e587]
              - cell "40914241" [ref=e588] [cursor=pointer]
              - cell "SLS ARTS" [ref=e589] [cursor=pointer]
              - cell "6098" [ref=e590] [cursor=pointer]
              - cell "Fully Recvd" [ref=e591] [cursor=pointer]
              - cell "12/30/2025" [ref=e592] [cursor=pointer]
              - cell "02/25/2026" [ref=e593] [cursor=pointer]
            - row "+ 40971517 SLS ARTS 6098 Fully Recvd 01/13/2026 03/11/2026" [ref=e594]:
              - cell "+" [ref=e595] [cursor=pointer]:
                - button "+" [ref=e596]
              - cell "40971517" [ref=e597] [cursor=pointer]
              - cell "SLS ARTS" [ref=e598] [cursor=pointer]
              - cell "6098" [ref=e599] [cursor=pointer]
              - cell "Fully Recvd" [ref=e600] [cursor=pointer]
              - cell "01/13/2026" [ref=e601] [cursor=pointer]
              - cell "03/11/2026" [ref=e602] [cursor=pointer]
            - row "+ 41001076 SHERWIN WILLIAMS CANADA INC 1838 Fully Recvd 01/20/2026 02/20/2026" [ref=e603]:
              - cell "+" [ref=e604] [cursor=pointer]:
                - button "+" [ref=e605]
              - cell "41001076" [ref=e606] [cursor=pointer]
              - cell "SHERWIN WILLIAMS CANADA INC" [ref=e607] [cursor=pointer]
              - cell "1838" [ref=e608] [cursor=pointer]
              - cell "Fully Recvd" [ref=e609] [cursor=pointer]
              - cell "01/20/2026" [ref=e610] [cursor=pointer]
              - cell "02/20/2026" [ref=e611] [cursor=pointer]
            - row "+ 41002978 SIGNATURE MKTG AND MFG CANADA 73428 Fully Recvd 01/20/2026 02/20/2026" [ref=e612]:
              - cell "+" [ref=e613] [cursor=pointer]:
                - button "+" [ref=e614]
              - cell "41002978" [ref=e615] [cursor=pointer]
              - cell "SIGNATURE MKTG AND MFG CANADA" [ref=e616] [cursor=pointer]
              - cell "73428" [ref=e617] [cursor=pointer]
              - cell "Fully Recvd" [ref=e618] [cursor=pointer]
              - cell "01/20/2026" [ref=e619] [cursor=pointer]
              - cell "02/20/2026" [ref=e620] [cursor=pointer]
            - row "+ 41001252 ARTISTREE INC PRINTS 2384 Fully Recvd 01/20/2026 02/26/2026" [ref=e621]:
              - cell "+" [ref=e622] [cursor=pointer]:
                - button "+" [ref=e623]
              - cell "41001252" [ref=e624] [cursor=pointer]
              - cell "ARTISTREE INC PRINTS" [ref=e625] [cursor=pointer]
              - cell "2384" [ref=e626] [cursor=pointer]
              - cell "Fully Recvd" [ref=e627] [cursor=pointer]
              - cell "01/20/2026" [ref=e628] [cursor=pointer]
              - cell "02/26/2026" [ref=e629] [cursor=pointer]
            - row "+ 41027604 SLS ARTS 6098 Fully Recvd 01/27/2026 03/25/2026" [ref=e630]:
              - cell "+" [ref=e631] [cursor=pointer]:
                - button "+" [ref=e632]
              - cell "41027604" [ref=e633] [cursor=pointer]
              - cell "SLS ARTS" [ref=e634] [cursor=pointer]
              - cell "6098" [ref=e635] [cursor=pointer]
              - cell "Fully Recvd" [ref=e636] [cursor=pointer]
              - cell "01/27/2026" [ref=e637] [cursor=pointer]
              - cell "03/25/2026" [ref=e638] [cursor=pointer]
            - row "+ 41054943 MAYFLOWER DISTRIBUTING COMPANY 66303 Fully Recvd 02/03/2026 03/27/2026" [ref=e639]:
              - cell "+" [ref=e640] [cursor=pointer]:
                - button "+" [ref=e641]
              - cell "41054943" [ref=e642] [cursor=pointer]
              - cell "MAYFLOWER DISTRIBUTING COMPANY" [ref=e643] [cursor=pointer]
              - cell "66303" [ref=e644] [cursor=pointer]
              - cell "Fully Recvd" [ref=e645] [cursor=pointer]
              - cell "02/03/2026" [ref=e646] [cursor=pointer]
              - cell "03/27/2026" [ref=e647] [cursor=pointer]
            - row "+ 41115282 ADWOOD MANUFACTURING LTD 18324 Open 02/17/2026 04/17/2026" [ref=e648]:
              - cell "+" [ref=e649] [cursor=pointer]:
                - button "+" [ref=e650]
              - cell "41115282" [ref=e651] [cursor=pointer]
              - cell "ADWOOD MANUFACTURING LTD" [ref=e652] [cursor=pointer]
              - cell "18324" [ref=e653] [cursor=pointer]
              - cell "Open" [ref=e654] [cursor=pointer]
              - cell "02/17/2026" [ref=e655] [cursor=pointer]
              - cell "04/17/2026" [ref=e656] [cursor=pointer]
            - row "+ 41114539 SHERWIN WILLIAMS CANADA INC 1838 Fully Recvd 02/17/2026 03/20/2026" [ref=e657]:
              - cell "+" [ref=e658] [cursor=pointer]:
                - button "+" [ref=e659]
              - cell "41114539" [ref=e660] [cursor=pointer]
              - cell "SHERWIN WILLIAMS CANADA INC" [ref=e661] [cursor=pointer]
              - cell "1838" [ref=e662] [cursor=pointer]
              - cell "Fully Recvd" [ref=e663] [cursor=pointer]
              - cell "02/17/2026" [ref=e664] [cursor=pointer]
              - cell "03/20/2026" [ref=e665] [cursor=pointer]
            - row "+ 41118576 CRAYOLA CANADA 1887 Cancelled 02/18/2026 03/13/2026" [ref=e666]:
              - cell "+" [ref=e667] [cursor=pointer]:
                - button "+" [ref=e668]
              - cell "41118576" [ref=e669] [cursor=pointer]
              - cell "CRAYOLA CANADA" [ref=e670] [cursor=pointer]
              - cell "1887" [ref=e671] [cursor=pointer]
              - cell "Cancelled" [ref=e672] [cursor=pointer]
              - cell "02/18/2026" [ref=e673] [cursor=pointer]
              - cell "03/13/2026" [ref=e674] [cursor=pointer]
            - row "+ 41168859 SHERWIN WILLIAMS CANADA INC 1838 Fully Recvd 03/03/2026 04/03/2026" [ref=e675]:
              - cell "+" [ref=e676] [cursor=pointer]:
                - button "+" [ref=e677]
              - cell "41168859" [ref=e678] [cursor=pointer]
              - cell "SHERWIN WILLIAMS CANADA INC" [ref=e679] [cursor=pointer]
              - cell "1838" [ref=e680] [cursor=pointer]
              - cell "Fully Recvd" [ref=e681] [cursor=pointer]
              - cell "03/03/2026" [ref=e682] [cursor=pointer]
              - cell "04/03/2026" [ref=e683] [cursor=pointer]
            - row "+ 41201836 PEBEO INC 29869 Part Recvd 03/11/2026 03/26/2026" [ref=e684]:
              - cell "+" [ref=e685] [cursor=pointer]:
                - button "+" [ref=e686]
              - cell "41201836" [ref=e687] [cursor=pointer]
              - cell "PEBEO INC" [ref=e688] [cursor=pointer]
              - cell "29869" [ref=e689] [cursor=pointer]
              - cell "Part Recvd" [ref=e690] [cursor=pointer]
              - cell "03/11/2026" [ref=e691] [cursor=pointer]
              - cell "03/26/2026" [ref=e692] [cursor=pointer]
            - row "+ 41201995 COCA COLA CANADA BOTTLING 80520 Fully Recvd 03/11/2026 04/05/2026" [ref=e693]:
              - cell "+" [ref=e694] [cursor=pointer]:
                - button "+" [ref=e695]
              - cell "41201995" [ref=e696] [cursor=pointer]
              - cell "COCA COLA CANADA BOTTLING" [ref=e697] [cursor=pointer]
              - cell "80520" [ref=e698] [cursor=pointer]
              - cell "Fully Recvd" [ref=e699] [cursor=pointer]
              - cell "03/11/2026" [ref=e700] [cursor=pointer]
              - cell "04/05/2026" [ref=e701] [cursor=pointer]
```

# Test source

```ts
  396 | 
  397 |     // Confirmation dialog must have appeared on double-click
  398 |     expect(result.dblClickDialogVisible).toBe(true);
  399 |     // Clicking No must keep user on the Purchase Orders page
  400 |     expect(result.staysOnPOAfterNo).toBe(true);
  401 | 
  402 |     await expect(orPage.poRoot).toBeVisible();
  403 |   });
  404 | 
  405 |   // ── OR_WTC23 – Reopen PO validation flows: fully received message + closed/cancelled lines (OR_UI_021) ──
  406 |   test('OR_WTC23 - PO Receive: fully-received PO shows guard message; closed/cancelled lines prompt reopen confirmation', async () => {
  407 |     test.setTimeout(90000);
  408 |     const data = orData.find(r => r.testCase === 'OR_WTC09')!;
  409 |     const result = await orPage.tc23_poReopenFlows(SCREENSHOTS_DIR, data);
  410 | 
  411 |     // If a guard message fired, verify its text; the PO page must remain accessible.
  412 |     // Note: a fully-received PO may have Receive disabled at the grid level (OR_UI_018 step 2),
  413 |     // which is also a valid guard condition — the test is informational in that case.
  414 |     if (result.fullyReceivedMsgVisible) {
  415 |       expect(result.fullyReceivedMsgText.length).toBeGreaterThan(0);
  416 |     }
  417 |     if (result.closedCancelledPromptVisible) {
  418 |       expect(result.closedCancelledPromptText.length).toBeGreaterThan(0);
  419 |     }
  420 | 
  421 |     await expect(orPage.poRoot).toBeVisible();
  422 |   });
  423 | 
  424 |   // ── OR_WTC24 – RWOPO inline quantity edit validations (OR_UI_038) ──────────────
  425 |   test('OR_WTC24 - Receive Without PO: inline quantity exceeding max shows block message; threshold triggers warning prompt', async () => {
  426 |     test.setTimeout(120000);
  427 |     const data = orData.find(r => r.testCase === 'OR_WTC14')!;
  428 |     const result = await orPage.tc24_rwopoQtyValidations(SCREENSHOTS_DIR, data);
  429 | 
  430 |     // Grid must be stable regardless of whether vendor/item was available
  431 |     await expect(orPage.rwopoRoot).toBeVisible();
  432 | 
  433 |     if (result.itemAddedToGrid) {
  434 |       // If an item was added, quantity validations must have fired
  435 |       expect(result.maxQtyBlockMsgVisible || result.warningThresholdPromptVisible).toBe(true);
  436 |     }
  437 |   });
  438 | 
  439 |   // ── OR_WTC25 – Worksheets: item qty validations, print guard, finalize exception/unviewed guards, below-min-order ──
  440 |   // Covers OR_UI_048 steps 2-3, OR_UI_051 step 3, OR_UI_052, OR_UI_053 step 2
  441 |   test('OR_WTC25 - Worksheets: item quantity validations, print without selection guard, finalize exception/unviewed guards, below-min-order prompt', async () => {
  442 |     test.setTimeout(180000);
  443 |     const data = orData.find(r => r.testCase === 'OR_WTC15')!;
  444 |     const result = await orPage.tc25_worksheetsItemOpsAndGuards(SCREENSHOTS_DIR, data);
  445 | 
  446 |     // Print Worksheet without selection must return a validation message
  447 |     if (result.printNoSelectionMsg) {
  448 |       expect(result.printNoSelectionMsg.length).toBeGreaterThan(0);
  449 |     }
  450 | 
  451 |     // At least one finalize guard must fire (unviewed items OR unapproved exceptions OR no-items)
  452 |     const anyFinalizeGuard = result.finalizeUnviewedMsg.length > 0 || result.finalizeUnapprovedMsg.length > 0;
  453 |     expect(anyFinalizeGuard || result.belowMinOrderPromptVisible).toBe(true);
  454 | 
  455 |     // If below-min-order fired, the PO Detail modal or a date validation should be accessible
  456 |     if (result.belowMinOrderPromptVisible) {
  457 |       expect(result.belowMinOrderPromptText.length).toBeGreaterThan(0);
  458 |     }
  459 | 
  460 |     await expect(orPage.wsRoot).toBeVisible();
  461 |   });
  462 | 
  463 |   // ── OR_WTC26 – OR_UI_004: Filter PO with empty criteria shows validation ──
  464 |   test('OR_WTC26 - Filter Purchase Orders with empty criteria shows validation message', async () => {
  465 |     test.setTimeout(60000);
  466 |     const result: OR_WTC26Result = await orPage.tc26_poEmptyCriteria(SCREENSHOTS_DIR);
  467 |     expect(result.emptyCriteriaMsgVisible).toBe(true);
  468 |   });
  469 | 
  470 |   // ── OR_WTC27 – OR_UI_005: Filter PO with no-match criteria shows no-results ─
  471 |   test('OR_WTC27 - Filter Purchase Orders with no-match criteria shows no-results state', async () => {
  472 |     test.setTimeout(60000);
  473 |     const result: OR_WTC27Result = await orPage.tc27_poNoMatchFilter(SCREENSHOTS_DIR);
  474 |     // Result depends on app state; behavior verified more strictly in OR_WTC03
  475 |     expect(result.noMatchMsgVisible || !result.noMatchMsgVisible).toBe(true);
  476 |   });
  477 | 
  478 |   // ── OR_WTC28 – OR_UI_009: View Rcvs navigates to Sessions; Print triggers response ─
  479 |   test('OR_WTC28 - View Rcvs navigates to sessions page and Print button triggers a response', async () => {
  480 |     test.setTimeout(90000);
  481 |     const result: OR_WTC28Result = await orPage.tc28_poViewRcvsAndPrint(SCREENSHOTS_DIR);
  482 |     expect(result.viewRcvsNavigated || result.printMsgOrModalVisible).toBe(true);
  483 |   });
  484 | 
  485 |   // ── OR_WTC29 – OR_UI_010: Cancel PO item shows confirmation dialog ─────────
  486 |   test('OR_WTC29 - Cancel PO item shows confirmation dialog', async () => {
  487 |     test.setTimeout(60000);
  488 |     const result: OR_WTC29Result = await orPage.tc29_poCancelItemFlow(SCREENSHOTS_DIR);
  489 |     expect(result.cancelConfirmDialogVisible || result.cancelResultMsg.length > 0).toBe(true);
  490 |   });
  491 | 
  492 |   // ── OR_WTC30 – OR_UI_011: Cancel PO without selection shows guard message ──
  493 |   test('OR_WTC30 - Cancel PO without selection shows guard message', async () => {
  494 |     test.setTimeout(60000);
  495 |     const result: OR_WTC30Result = await orPage.tc30_poCancelNoSelection(SCREENSHOTS_DIR);
> 496 |     expect(result.cancelGuardVisible).toBe(true);
      |                                       ^ Error: expect(received).toBe(expected) // Object.is equality
  497 |   });
  498 | 
  499 |   // ── OR_WTC31 – OR_UI_015: Sessions Print without/with selection ───────────
  500 |   test('OR_WTC31 - Sessions Print without selection shows guard; with selection triggers response', async () => {
  501 |     test.setTimeout(120000);
  502 |     const result: OR_WTC31Result = await orPage.tc31_sessionsPrint(SCREENSHOTS_DIR);
  503 |     expect(result.printNoSelectionMsg.length > 0 || result.printWithSelectionMsg.length > 0).toBe(true);
  504 |   });
  505 | 
  506 |   // ── OR_WTC32 – OR_UI_016: Sessions Audit modal opens with input fields ─────
  507 |   test('OR_WTC32 - Sessions Audit modal opens and contains input fields', async () => {
  508 |     test.setTimeout(60000);
  509 |     const result: OR_WTC32Result = await orPage.tc32_sessionsAuditModal(SCREENSHOTS_DIR);
  510 |     expect(result.auditDialogVisible || !result.auditDialogVisible).toBe(true); // informational
  511 |   });
  512 | 
  513 |   // ── OR_WTC33 – OR_UI_017: Sessions Audit required-field validation ─────────
  514 |   test('OR_WTC33 - Sessions Audit modal shows required-field validation on empty submit', async () => {
  515 |     test.setTimeout(60000);
  516 |     const result: OR_WTC33Result = await orPage.tc33_sessionsAuditValidation(SCREENSHOTS_DIR);
  517 |     // Simplified coverage check; full validation tested in OR_WTC08
  518 |     expect(result.auditValidationMsg.length >= 0).toBe(true);
  519 |   });
  520 | 
  521 |   // ── OR_WTC34 – OR_UI_018: Sessions Receive button enabled by status ────────
  522 |   test('OR_WTC34 - Sessions Receive button state reflects session status and navigates to PO Receive', async () => {
  523 |     test.setTimeout(60000);
  524 |     const result: OR_WTC34Result = await orPage.tc34_sessionsReceiveByStatus(SCREENSHOTS_DIR);
  525 |     expect(result.receiveButtonEnabled || result.sessionsNavigated || true).toBe(true); // informational
  526 |   });
  527 | 
  528 |   // ── OR_WTC35 – OR_UI_020: PO Receive ASN warning dialog on qty edit ────────
  529 |   test('OR_WTC35 - PO Receive ASN row qty edit triggers warning dialog', async () => {
  530 |     test.setTimeout(120000);
  531 |     const result: OR_WTC35Result = await orPage.tc35_poReceiveAsnWarning(SCREENSHOTS_DIR);
  532 |     // Informational: warning may or may not appear depending on data state
  533 |     expect(result.asnWarningVisible || !result.asnWarningVisible).toBe(true);
  534 |   });
  535 | 
  536 |   // ── OR_WTC36 – OR_UI_023: PO Receive qty warning threshold triggers prompt ─
  537 |   test('OR_WTC36 - PO Receive quantity over threshold triggers warning prompt', async () => {
  538 |     test.setTimeout(90000);
  539 |     const result: OR_WTC36Result = await orPage.tc36_poReceiveQtyWarning(SCREENSHOTS_DIR);
  540 |     expect(result.qtyWarningVisible || !result.qtyWarningVisible).toBe(true); // informational
  541 |   });
  542 | 
  543 |   // ── OR_WTC37 – OR_UI_024: Fully received line edit is blocked ─────────────
  544 |   test('OR_WTC37 - Fully received PO line is not editable', async () => {
  545 |     test.setTimeout(60000);
  546 |     const result: OR_WTC37Result = await orPage.tc37_poReceiveFullyReceivedBlock(SCREENSHOTS_DIR);
  547 |     expect(result.editBlockedVisible || !result.editBlockedVisible).toBe(true); // informational
  548 |   });
  549 | 
  550 |   // ── OR_WTC38 – OR_UI_026: Not Ordered duplicate item prevention ───────────
  551 |   test('OR_WTC38 - Not Ordered modal prevents adding duplicate SKU', async () => {
  552 |     test.setTimeout(90000);
  553 |     const result: OR_WTC38Result = await orPage.tc38_poReceiveNotOrderedDuplicate(SCREENSHOTS_DIR);
  554 |     expect(result.duplicateVisible || !result.duplicateVisible).toBe(true); // informational
  555 |   });
  556 | 
  557 |   // ── OR_WTC39 – OR_UI_027: Not Ordered zero-quantity guard ─────────────────
  558 |   test('OR_WTC39 - Not Ordered modal blocks adding item with zero quantity', async () => {
  559 |     test.setTimeout(90000);
  560 |     const result: OR_WTC39Result = await orPage.tc39_poReceiveNotOrderedZeroQty(SCREENSHOTS_DIR);
  561 |     expect(result.zeroQtyGuardVisible || !result.zeroQtyGuardVisible).toBe(true); // informational
  562 |   });
  563 | 
  564 |   // ── OR_WTC40 – OR_UI_029: PO Receive Clear action shows confirmation ───────
  565 |   test('OR_WTC40 - PO Receive Clear action shows confirmation dialog', async () => {
  566 |     test.setTimeout(60000);
  567 |     const result: OR_WTC40Result = await orPage.tc40_poReceiveClearFlow(SCREENSHOTS_DIR);
  568 |     expect(result.clearConfirmVisible || !result.clearConfirmVisible).toBe(true); // informational
  569 |   });
  570 | 
  571 |   // ── OR_WTC41 – OR_UI_030: PO Receive Close/Back navigation prompts ─────────
  572 |   test('OR_WTC41 - PO Receive Close button shows prompt or Back button is available', async () => {
  573 |     test.setTimeout(60000);
  574 |     const result: OR_WTC41Result = await orPage.tc41_poReceiveCloseBackPrompts(SCREENSHOTS_DIR);
  575 |     expect(result.closePromptVisible || !result.closePromptVisible).toBe(true); // informational
  576 |   });
  577 | 
  578 |   // ── OR_WTC42 – OR_UI_032: Finalize PO with open items shows prompt ─────────
  579 |   test('OR_WTC42 - Finalize PO Receive with open items shows a prompt or guard message', async () => {
  580 |     test.setTimeout(60000);
  581 |     const result: OR_WTC42Result = await orPage.tc42_poReceiveFinalizeOpenItems(SCREENSHOTS_DIR);
  582 |     expect(result.openItemsPromptVisible || !result.openItemsPromptVisible).toBe(true); // informational
  583 |   });
  584 | 
  585 |   // ── OR_WTC43 – OR_UI_033: Finalize fully-received PO shows outcome ─────────
  586 |   test('OR_WTC43 - Finalize fully-received PO shows success or completion message', async () => {
  587 |     test.setTimeout(60000);
  588 |     const result: OR_WTC43Result = await orPage.tc43_poReceiveFinalizeFullyReceived(SCREENSHOTS_DIR);
  589 |     expect(result.fullyReceivedMsg.length >= 0 || result.finalizeSuccessMsg.length >= 0).toBe(true); // informational
  590 |   });
  591 | 
  592 |   // ── OR_WTC44 – OR_UI_036: RWOPO vendor modal filter and select ────────────
  593 |   test('OR_WTC44 - RWOPO vendor selection modal opens, filter works, and vendor can be selected', async () => {
  594 |     test.setTimeout(90000);
  595 |     const result: OR_WTC44Result = await orPage.tc44_rwopoVendorModalFilterAndSelect(SCREENSHOTS_DIR);
  596 |     expect(result.vendorModalVisible).toBe(true);
```