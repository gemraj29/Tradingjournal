# Token Flow — How CodeDNA Stays Within Budget

```mermaid
graph TD
  A["User Prompt"] --> B["Task Planner\n~4k tokens"]
  B --> C["Context Assembler"]
  C --> D["Project DNA Identity\n~300 tokens (FIXED)"]
  C --> E["Task Description\n~100 tokens (FIXED)"]
  C --> F["Target File Contents\n~5000 tokens max"]
  C --> G["Module Context Cards\n~5000 tokens max"]
  D & E & F & G --> H["LLM Prompt\n≤16,000 tokens total"]
  H --> I["LLM Response\n≤6,000 output tokens"]
  I --> J["File Block Parser"]
  J --> K["Quality Gates"]
  K --> L["Write Files to Disk"]
  L --> M["Update Context Cards"]
  M --> N["Git Commit + Checkpoint"]
```

## Token Budget: google/gemini/gemini-2.5-flash

| Budget Item | Tokens |
|-------------|--------|
| Context window | 16,000 |
| Output reserve per task | 6,000 |
| Input budget per task | 10,000 |
| DNA identity block | ~300 (never dropped) |
| Task description | ~100 (never dropped) |
| Per module context card | ~200 |
| Max modules in context | ~10 |
