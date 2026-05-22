# 🤖 Claude PM Skills

> **AI-native Product Management workflow**: Custom Claude skills that transform how Product Managers write specs, create user stories, and ensure architectural alignment.

## 🎯 Overview

As a Product Manager building products for museums and cultural institutions, I've developed three custom Claude skills that accelerate my workflow from idea to implementation:

1. **Mini Spec Writer** - Converts product ideas into structured, implementation-ready specifications
2. **Jira Story Writer** - Transforms specs into well-formatted Jira user stories with Gherkin acceptance criteria
3. **Architecture-Aware Reviewer** - Reviews specs against architecture principles and ADRs to catch conflicts early

These skills are built using [Claude's MCP (Model Context Protocol)](https://www.anthropic.com/news/model-context-protocol) and demonstrate how AI can augment—not replace—product management work.

---

## 🚀 Why I Built This

**The Problem:**
- Writing specs from scratch takes hours
- Converting specs to user stories is repetitive and error-prone
- Architecture conflicts are caught too late (during implementation)
- Context switching between tools (Notion → Jira → Confluence) kills productivity

**The Solution:**
AI-assisted PM workflow that:
- ✅ Reduces spec writing time by 60%
- ✅ Ensures consistent story format across teams
- ✅ Catches architecture conflicts before engineering picks up work
- ✅ Maintains quality while increasing velocity

---

## 📂 Repository Structure

```
claude-pm-skills/
├── README.md                          # This file
├── mini-spec-writer/
│   ├── SKILL.md                       # Skill documentation
│   └── examples/
│       ├── input-example.md           # Sample input
│       └── output-example.md          # Sample output
├── jira-story-writer/
│   ├── SKILL.md                       # Skill documentation
│   └── examples/
│       ├── input-spec.md              # Sample spec input
│       └── output-stories.md          # Sample Jira stories
└── architecture-aware-reviewer/
    ├── SKILL.md                       # Skill documentation
    └── examples/
        ├── input-spec.md              # Spec to review
        └── review-output.md           # Review feedback
```

---

## 🛠️ How It Works

Each skill is invoked inside Claude Code using a `/skill-name` command. Claude reads the skill definition from `SKILL.md`, applies the documented workflow, and produces structured output.

```bash
# Example usage inside Claude Code
/mini-spec-writer
/jira-story-writer
/architecture-aware-reviewer
```

---

## 📊 Impact

| Metric | Before | After |
|---|---|---|
| Spec writing time | 3–4 hours | 45–60 min |
| Story writing time | 1–2 hours | 15–20 min |
| Architecture conflicts caught pre-sprint | ~20% | ~85% |
| Story format consistency | Variable | 100% |

---

## 🔗 Links

- 📧 Contact: [jdavidramosf@gmail.com](mailto:jdavidramosf@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/juandrf](https://linkedin.com/in/juandrf)
- 🐙 GitHub: [@JuanDRF2](https://github.com/JuanDRF2)

---

**Built by Juan Ramos** | Product Manager specializing in AI-native workflows and full-stack product development
