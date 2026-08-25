# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventoryAdjustments.spec.ts >> Inventory Adjustments >> IA_WTC18 - IA History: text filter narrows records, clear restores all, column header sort works
- Location: tests/inventoryAdjustments.spec.ts:455:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e9] [cursor=pointer]: print
  - generic [ref=e11]:
    - generic [ref=e14]: 
    - generic [ref=e17]:
      - list [ref=e18]:
        - listitem
        - listitem [ref=e19]:
          - generic [ref=e20] [cursor=pointer]:
            - text: Quantity-On-Hand Validation
            - generic "Close Tab" [ref=e21]:
              - superscript [ref=e22]: x
        - listitem [ref=e23]:
          - generic [ref=e24] [cursor=pointer]:
            - text: Return To Vendor
            - generic "Close Tab" [ref=e25]:
              - superscript [ref=e26]: x
        - listitem [ref=e27]:
          - generic [ref=e28] [cursor=pointer]:
            - text: Inventory Adjustment History
            - generic "Close Tab" [ref=e29]:
              - superscript [ref=e30]: x
      - generic: 
      - generic:  
      - generic: 
      - generic [ref=e34]:
        - generic [ref=e36]: 
        - generic [ref=e41]:
          - generic [ref=e46]:
            - textbox "Filter" [ref=e47]
            - generic:
              - generic: Filter
          - grid [ref=e49]:
            - row "Change sorting for AdjustDate Change sorting for SkuNumber Change sorting for UpcNumber Change sorting for Quantity Change sorting for ReasonCode Change sorting for Effect Change sorting for ItemDescription Change sorting for UserId" [ref=e50]:
              - columnheader "Change sorting for AdjustDate" [ref=e51]:
                - button "Change sorting for AdjustDate" [ref=e53] [cursor=pointer]: Adjust Date/Time
              - columnheader "Change sorting for SkuNumber" [ref=e54]:
                - button "Change sorting for SkuNumber" [ref=e56] [cursor=pointer]: "Sku #"
              - columnheader "Change sorting for UpcNumber" [ref=e57]:
                - button "Change sorting for UpcNumber" [ref=e59] [cursor=pointer]: "Upc #"
              - columnheader "Change sorting for Quantity" [ref=e60]:
                - button "Change sorting for Quantity" [ref=e62] [cursor=pointer]: Qty
              - columnheader "Change sorting for ReasonCode" [ref=e63]:
                - button "Change sorting for ReasonCode" [ref=e65] [cursor=pointer]: Code
              - columnheader "Change sorting for Effect" [ref=e66]:
                - button "Change sorting for Effect" [ref=e68] [cursor=pointer]: +/-
              - columnheader "Change sorting for ItemDescription" [ref=e69]:
                - button "Change sorting for ItemDescription" [ref=e71] [cursor=pointer]: Item Description
              - columnheader "Change sorting for UserId" [ref=e72]:
                - button "Change sorting for UserId" [ref=e74] [cursor=pointer]: Scanned By
            - row [ref=e75] [cursor=pointer]:
              - gridcell
              - gridcell
              - gridcell
              - gridcell
              - gridcell
              - gridcell
              - gridcell
              - gridcell
          - generic [ref=e77]:
            - generic [ref=e78]:
              - generic [ref=e79]: "Items per page:"
              - listbox "Items per page:" [ref=e84] [cursor=pointer]:
                - generic [ref=e87]: "10"
            - generic [ref=e91]:
              - generic [ref=e92]: 0 of 0
              - button "Previous page" [disabled] [ref=e93]
              - button "Next page" [disabled] [ref=e96]
```

# Test source

```ts
  1669 |       }).catch(() => false);
  1670 | 
  1671 |       if (saveVendorClicked) {
  1672 |         await this.page.waitForTimeout(1500);
  1673 |         saveVendorInfoMsg = await this.getToastOrAlertText();
  1674 |         await this.takeScreenshot(screenshotDir, 'IA_WTC18_04_vendor_saved');
  1675 |         await this.dismissAlertOrModal();
  1676 |       }
  1677 |     }
  1678 |     await this.takeScreenshot(screenshotDir, 'IA_WTC18_05_done');
  1679 | 
  1680 |     return { reasonDropdownVisible, reasonOptionCount, specialInstructionsSaved, saveMiscInfoMsg, vendorInfoFieldsVisible, saveVendorInfoMsg };
  1681 |   }
  1682 | 
  1683 |   // ── IA_WTC19 – QOH Filter Dialog ───────────────────────────────────────────
  1684 | 
  1685 |   async ia19_qohFilterDialog(screenshotDir: string): Promise<IA_WTC19Result> {
  1686 |     await this.navigateToQohValidation();
  1687 |     await this.forceCloseSidebar();
  1688 |     await this.page.waitForTimeout(800);
  1689 |     await this.takeScreenshot(screenshotDir, 'IA_WTC19_01_qoh_page');
  1690 | 
  1691 |     let filterDialogOpened = false;
  1692 |     let filterDialogTitle = '';
  1693 |     let userIdColumnVisible = false;
  1694 |     let allUsersRowVisible = false;
  1695 |     let cancelWorks = false;
  1696 |     let filterBtnInDialogVisible = false;
  1697 | 
  1698 |     // Click the Filter button (not the text filter input)
  1699 |     const filterBtn = await this.page.evaluate(() => {
  1700 |       const btns = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
  1701 |       const visible = btns.filter(b => {
  1702 |         const s = window.getComputedStyle(b);
  1703 |         return s.display !== 'none' && s.visibility !== 'hidden' && b.offsetWidth > 0;
  1704 |       });
  1705 |       const fb = visible.find(b => b.textContent?.trim() === 'Filter');
  1706 |       if (fb) { fb.click(); return true; }
  1707 |       return false;
  1708 |     }).catch(() => false);
  1709 | 
  1710 |     await this.page.waitForTimeout(1500);
  1711 |     await this.takeScreenshot(screenshotDir, 'IA_WTC19_02_filter_dialog_opened');
  1712 | 
  1713 |     // Check if a dialog/modal opened
  1714 |     const dlgSel = '[role="dialog"], mat-dialog-container, .modal.in, .modal.show';
  1715 |     const dlg = this.page.locator(dlgSel).first();
  1716 |     filterDialogOpened = await dlg.isVisible({ timeout: 3000 }).catch(() => false);
  1717 | 
  1718 |     if (filterDialogOpened) {
  1719 |       // Check dialog title
  1720 |       const titleEl = this.page.locator(`${dlgSel} h1, ${dlgSel} h2, ${dlgSel} h3, ${dlgSel} .modal-title, ${dlgSel} mat-dialog-title`).first();
  1721 |       filterDialogTitle = ((await titleEl.textContent().catch(() => '')) ?? '').trim();
  1722 | 
  1723 |       // Check for UserId column header
  1724 |       const bodyTxt = await this.getBodyText();
  1725 |       userIdColumnVisible = /userid|user id/i.test(bodyTxt);
  1726 |       allUsersRowVisible  = /all users/i.test(bodyTxt);
  1727 | 
  1728 |       // Check for Filter button inside dialog
  1729 |       filterBtnInDialogVisible = await this.page.locator(`${dlgSel} button:has-text("Filter")`).first()
  1730 |         .isVisible({ timeout: 2000 }).catch(() => false);
  1731 | 
  1732 |       await this.takeScreenshot(screenshotDir, 'IA_WTC19_03_dialog_contents');
  1733 | 
  1734 |       // Click Cancel to close the dialog
  1735 |       // Cancel button may not be scoped inside dlgSel if dialog uses a custom overlay
  1736 |       const cancelBtn = this.page.locator('button:has-text("Cancel")').filter({ visible: true }).first();
  1737 |       if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  1738 |         await cancelBtn.click({ force: true });
  1739 |         await this.page.waitForTimeout(1500);
  1740 |         // If the element is removed from DOM, isVisible times out → catch(() => false) = not visible
  1741 |         const dialogStillVisible = await dlg.isVisible({ timeout: 1500 }).catch(() => false);
  1742 |         cancelWorks = !dialogStillVisible;
  1743 |       } else {
  1744 |         await this.dismissAlertOrModal();
  1745 |         // If dialog is gone after dismissAlertOrModal, cancel worked
  1746 |         const dialogStillVisible = await dlg.isVisible({ timeout: 1000 }).catch(() => false);
  1747 |         cancelWorks = !dialogStillVisible;
  1748 |       }
  1749 |     } else {
  1750 |       // Some implementations embed the filter inline - check body text for UserId
  1751 |       const bodyTxt = await this.getBodyText();
  1752 |       filterDialogOpened = /userid|filter.*user/i.test(bodyTxt);
  1753 |       userIdColumnVisible = filterDialogOpened;
  1754 |       allUsersRowVisible  = /all users/i.test(bodyTxt);
  1755 |     }
  1756 | 
  1757 |     await this.takeScreenshot(screenshotDir, 'IA_WTC19_04_done');
  1758 |     return { filterDialogOpened, filterDialogTitle, userIdColumnVisible, allUsersRowVisible, cancelWorks, filterBtnInDialogVisible };
  1759 |   }
  1760 | 
  1761 |   // ── IA_WTC20 – IA History Filter with Results and Column Sort ──────────────
  1762 | 
  1763 |   async ia20_iaHistoryFilterAndSort(screenshotDir: string): Promise<IA_WTC20Result> {
  1764 |     await this.navigateToIaHistory();
  1765 |     await this.forceCloseSidebar();
  1766 |     await this.page.waitForFunction(() =>
  1767 |       document.body.innerText.includes('Adjust') || document.body.innerText.includes('History')
  1768 |     , { timeout: 8000 }).catch(() => {});
> 1769 |     await this.page.waitForTimeout(500);
       |                     ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  1770 |     await this.takeScreenshot(screenshotDir, 'IA_WTC20_01_ia_history_loaded');
  1771 | 
  1772 |     let gridVisible = false;
  1773 |     let initialRowCount = 0;
  1774 |     let filterApplied = false;
  1775 |     let filteredRowCount = 0;
  1776 |     let filterCleared = false;
  1777 |     let columnSortAttempted = false;
  1778 |     let sortOrderChanged = false;
  1779 | 
  1780 |     gridVisible = await this.isGridPresent();
  1781 | 
  1782 |     // Count initial visible rows
  1783 |     initialRowCount = await this.page.locator(
  1784 |       'table.mat-table tr.mat-row, mat-table mat-row, table.table-hover tr.rowSelector'
  1785 |     ).count();
  1786 | 
  1787 |     // Apply a filter using the text filter input
  1788 |     const filterInput = this.page.locator('input[placeholder*="Filter"]').filter({ visible: true }).first();
  1789 |     if (await filterInput.isVisible({ timeout: 3000 }).catch(() => false)) {
  1790 |       // Type a filter term likely to narrow results (use a common code like "DMGS")
  1791 |       await filterInput.fill('DMGS');
  1792 |       await this.page.waitForTimeout(1000);
  1793 |       filteredRowCount = await this.page.locator(
  1794 |         'table.mat-table tr.mat-row, mat-table mat-row, table.table-hover tr.rowSelector'
  1795 |       ).count();
  1796 |       filterApplied = true;
  1797 |       await this.takeScreenshot(screenshotDir, 'IA_WTC20_02_filter_applied');
  1798 | 
  1799 |       // Clear the filter
  1800 |       await filterInput.fill('');
  1801 |       await this.page.waitForTimeout(800);
  1802 |       filterCleared = true;
  1803 |       await this.takeScreenshot(screenshotDir, 'IA_WTC20_03_filter_cleared');
  1804 |     }
  1805 | 
  1806 |     // Column sort — click the first column header
  1807 |     const colHeaders = this.page.locator('thead th, mat-header-cell').filter({ visible: true });
  1808 |     const headerCount = await colHeaders.count();
  1809 |     if (headerCount > 0) {
  1810 |       // Get first row text before sort
  1811 |       const firstRowBefore = await this.page.locator(
  1812 |         'table.mat-table tr.mat-row td:first-child, mat-table mat-row mat-cell:first-child, table.table-hover tr.rowSelector td:first-child'
  1813 |       ).first().textContent().catch(() => '');
  1814 | 
  1815 |       await colHeaders.first().click({ force: true });
  1816 |       await this.page.waitForTimeout(800);
  1817 |       columnSortAttempted = true;
  1818 | 
  1819 |       const firstRowAfter = await this.page.locator(
  1820 |         'table.mat-table tr.mat-row td:first-child, mat-table mat-row mat-cell:first-child, table.table-hover tr.rowSelector td:first-child'
  1821 |       ).first().textContent().catch(() => '');
  1822 | 
  1823 |       sortOrderChanged = firstRowBefore !== firstRowAfter;
  1824 |       await this.takeScreenshot(screenshotDir, 'IA_WTC20_04_after_sort');
  1825 | 
  1826 |       // Sort descending (click again)
  1827 |       await colHeaders.first().click({ force: true });
  1828 |       await this.page.waitForTimeout(800);
  1829 |       await this.takeScreenshot(screenshotDir, 'IA_WTC20_05_sort_desc');
  1830 |     }
  1831 | 
  1832 |     return { gridVisible, initialRowCount, filterApplied, filteredRowCount, filterCleared, columnSortAttempted, sortOrderChanged };
  1833 |   }
  1834 | 
  1835 |   // ── IA_WTC21 – Transfer View/Edit No-Selection Validation ──────────────────
  1836 | 
  1837 |   async ia21_transferViewEditValidation(screenshotDir: string): Promise<IA_WTC21Result> {
  1838 |     await this.navigateToOutboundTransfer();
  1839 |     await this.forceCloseSidebar();
  1840 |     await this.page.waitForTimeout(800);
  1841 |     await this.takeScreenshot(screenshotDir, 'IA_WTC21_01_transfer_page');
  1842 | 
  1843 |     let viewEditBtnVisible = false;
  1844 |     let noSelectionMsg = '';
  1845 |     let withSelectionOpened = false;
  1846 | 
  1847 |     const veBtn = this.page.locator('button:has-text("View/Edit"), button:has-text("Edit")').first();
  1848 |     viewEditBtnVisible = await this.visibleBtnExists(/View.?Edit|^Edit$/i);
  1849 | 
  1850 |     // Step 1: Click View/Edit without row selection
  1851 |     if (await veBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  1852 |       await veBtn.click({ force: true });
  1853 |       await this.page.waitForTimeout(1500);
  1854 |       noSelectionMsg = await this.getToastOrAlertText();
  1855 |       await this.takeScreenshot(screenshotDir, 'IA_WTC21_02_view_edit_no_sel');
  1856 |       await this.dismissAlertOrModal();
  1857 |     }
  1858 | 
  1859 |     // Step 2: Select a row (if available) and click View/Edit
  1860 |     const rowSelected = await this.selectFirstRow();
  1861 |     if (rowSelected) {
  1862 |       await this.page.waitForTimeout(500);
  1863 |       if (await veBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  1864 |         await veBtn.click({ force: true });
  1865 |         await this.page.waitForTimeout(2000);
  1866 |         const body = await this.getBodyText();
  1867 |         withSelectionOpened = /transfer item|add sku|sku|add item/i.test(body);
  1868 |         await this.takeScreenshot(screenshotDir, 'IA_WTC21_03_view_edit_with_sel');
  1869 |         // Navigate back
```