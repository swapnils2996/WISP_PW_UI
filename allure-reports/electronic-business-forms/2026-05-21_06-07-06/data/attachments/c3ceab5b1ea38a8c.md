# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: electronicBusinessForms.spec.ts >> Electronic Business Forms >> EBF_PBF_WTC01 - Load Printable Business Forms and validate page structure
- Location: tests/electronicBusinessForms.spec.ts:341:7

# Error details

```
Error: page.evaluate: TypeError: Cannot read properties of undefined (reading 'probe')
    at eval (eval at evaluate (:302:30), <anonymous>:4:32)
    at UtilityScript.evaluate (<anonymous>:304:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
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
    - generic [ref=e17] [cursor=pointer]: 
    - generic [ref=e20]:
      - list [ref=e21]:
        - listitem
      - generic [ref=e25]:
        - generic [ref=e27]:
          - img [ref=e29]
          - separator [ref=e30]
          - generic [ref=e31]: Windows In-Store Processor
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]: UserName (Logged in as)
            - generic [ref=e38]: ": system"
          - generic [ref=e39]:
            - generic [ref=e40]: Role Assigned
            - generic [ref=e41]: ": Admin"
          - generic [ref=e42]:
            - generic [ref=e43]: ISP Application Version
            - generic [ref=e44]: ": 21.0.0"
          - generic [ref=e45]:
            - generic [ref=e46]: Store Number (Host Name)
            - generic [ref=e47]: ": SR097402"
```