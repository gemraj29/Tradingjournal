# CodeDNA — Execution Loop

```mermaid
flowchart TD
    A(["`**codedna init** 'Build X'`"]) --> B["Create Project DNA\n.codedna/dna.json"]
    B --> C["Write Stack Templates\nto disk"]
    C --> D["Plan Task DAG\nvia LLM"]
    D --> E["Git Init + Initial Commit"]

    E --> F{{"Next pending task?"}}
    F -->|Yes| G["Allocate Token Budget"]
    G --> H["Assemble Context\nDNA + cards + files"]
    H --> I["Call LLM"]
    I --> J["Parse File Blocks"]
    J --> K["Quality Gates"]
    K -->|Pass| L["Write Files"]
    K -->|Fail| M["Auto-fix + Retry\n(max 2x)"]
    M --> L
    L --> N["Update Context Cards"]
    N --> O["Git Commit"]
    O --> P["Checkpoint to Disk"]
    P --> F
    F -->|No| Q(["`✅ **All tasks complete**`"])

    R(["`**codedna add** 'feature'`"]) --> S["Plan new tasks\nwith existing context"]
    S --> F

    T(["`**codedna continue**`"]) --> U["Load DNA + Checkpoint"]
    U --> F
```

## Key Properties

| Property | Value |
|----------|-------|
| LLM agnostic | ✅ Works with any provider via LiteLLM |
| Resumable | ✅ Checkpoint after every task |
| Token efficient | ✅ Context cards not full files |
| Identity preserving | ✅ DNA injected into every prompt |
| Scalable | ✅ Multiple LLMs/engineers via shared DNA |
| Version controlled | ✅ Every task = structured git commit |
