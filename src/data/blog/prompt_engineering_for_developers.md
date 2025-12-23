---
author: Chris Handy
pubDatetime: 2025-12-23T15:00:00Z
modDatetime: 2025-12-23T15:00:00Z
title: Prompt engineering for developers — practical patterns that work
slug: prompt-engineering-for-developers
featured: true
draft: false
tags:
  - ai
  - development
  - prompts
  - best-practices
ogImage: https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=1600
description:
  A practical guide to prompt engineering for software developers—patterns, anti-patterns, and real examples.
---

<figure>
  <img
    src="https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=1600"
    alt="Code on computer screen representing AI-assisted development"
  />
  <figcaption class="text-center">
    Image via <a href="https://www.pexels.com/">Pexels</a>
  </figcaption>

</figure>

> TL;DR: Good prompts are specific, provide context, and define success criteria. Use structured formats, examples, and constraints to get reliable outputs from AI models. Iteration beats perfection on the first try.

## Why developers need prompt engineering

If you're building with AI APIs or using coding assistants daily, prompt engineering isn't optional—it's a core skill. The difference between "write a function" and a well‑crafted prompt can mean:

- 10x fewer iterations to working code
- Outputs that match your style and architecture
- Consistent results across different runs
- Fewer hallucinations and off‑target responses

## The anatomy of a good prompt

A solid prompt has four elements:

1. **Context**: What the model needs to know (codebase info, constraints, style)
2. **Task**: The specific goal, clearly stated
3. **Format**: How you want the output structured
4. **Examples**: Concrete illustrations of what good looks like

### Basic pattern

```
# Context
You are a senior Python developer working on a FastAPI service.
Our style guide requires type hints, docstrings, and pytest tests.

# Task
Write a function that validates email addresses using regex.

# Format
Return the function definition, docstring, and 3 pytest test cases.

# Example
def validate_username(username: str) -> bool:
    """Check if username meets requirements."""
    ...
```

## Pattern library

### 1. Code generation with constraints

```
Write a React component for a loading spinner.

Requirements:
- Use TypeScript with strict types
- Accept size prop ("small" | "medium" | "large")
- Support custom color via CSS variable
- Include JSDoc comments
- No external dependencies

Return only the component code.
```

**Why it works**: Explicit constraints prevent the model from adding unwanted libraries, styles, or complexity.

### 2. Debugging with context

```
This function is throwing "Cannot read property 'id' of undefined":

[paste your code]

Context:
- user object comes from authenticated middleware
- sometimes the error happens on logout
- happens in production but not locally

Identify the bug and suggest a fix with defensive checks.
```

**Why it works**: Context about when/where the error occurs helps the model narrow hypotheses.

### 3. Code review with specific focus

```
Review this pull request for:
1. Security issues (SQL injection, XSS, auth bypasses)
2. Performance problems (N+1 queries, unnecessary loops)
3. Maintainability (naming, comments, modularity)

[paste diff]

Format: List issues as "File:Line - [Category] Description"
```

**Why it works**: Focused criteria prevent generic feedback. Structured output is easier to act on.

### 4. Refactoring with style preservation

```
Refactor this function to improve readability without changing behavior.

Our style:
- Early returns over nested ifs
- Descriptive variable names (no abbreviations)
- Extract complex conditions into named booleans

[paste code]

Show before/after with comments explaining changes.
```

**Why it works**: Style constraints keep the output aligned with your codebase conventions.

### 5. Test generation

```
Generate pytest test cases for this function:

[paste function]

Include:
- Happy path with typical inputs
- Edge cases (empty, null, boundary values)
- Error cases that should raise exceptions
- Parametrized tests where applicable

Use fixtures for common setup.
```

**Why it works**: Explicit test categories ensure coverage of typical failure modes.

## Anti‑patterns to avoid

### ❌ Vague requests

```
Make this better.
Optimize this code.
Fix the bug.
```

**Problem**: Model has to guess intent. You'll get generic improvements instead of targeted fixes.

### ❌ Missing context

```
Add authentication to this route.
```

**Problem**: Model doesn't know your auth stack (JWT? sessions? OAuth?), so it invents one.

### ❌ No constraints

```
Build a REST API for a todo app.
```

**Problem**: You'll get a kitchen‑sink implementation with a random framework, DB, and architectural choices.

### ❌ Overloading one prompt

```
Explain how this works, refactor it, write tests, document it, and suggest performance improvements.
```

**Problem**: The model tries to do everything and does none of it well. Break into separate prompts.

## Prompts for common dev tasks

### API endpoint design

```
Design a RESTful endpoint for updating user profile settings.

Stack: Node.js + Express + PostgreSQL
Auth: JWT in Authorization header
Requirements:
- Partial updates supported
- Validate email format and required fields
- Return 400 for validation errors, 200 with updated user object
- Include TypeScript types for request/response

Show: route definition, handler, validation middleware, and response types.
```

### Database query optimization

```
This Prisma query is slow on large datasets:

[paste query]

Context:
- users table has 500K rows
- we filter by status and created_at often
- current indexes: id (PK), email (unique)

Suggest:
1. Missing indexes
2. Query rewrite if needed
3. Expected performance improvement
```

### Documentation generation

```
Generate API documentation for this endpoint:

[paste code]

Format: OpenAPI 3.0 YAML
Include: path, method, parameters, request/response schemas, status codes, example request/response.
```

## Advanced techniques

### Chain of thought prompting

For complex logic, ask the model to show its reasoning:

```
Analyze this algorithm's time complexity.

Show your work:
1. Identify loops and their bounds
2. Note any nested operations
3. State the final Big‑O with explanation
```

### Few‑shot learning

Provide 2–3 examples of input/output pairs:

```
Convert natural language to SQL queries.

Example 1:
Input: "Show me all users who signed up last week"
Output: SELECT * FROM users WHERE created_at >= NOW() - INTERVAL '7 days';

Example 2:
Input: "Count active subscriptions by plan"
Output: SELECT plan, COUNT(*) FROM subscriptions WHERE status = 'active' GROUP BY plan;

Now convert:
Input: "Find the top 5 customers by total spend this year"
Output:
```

### Role assignment

Frame the model as a specific expert:

```
You are a senior DevOps engineer specializing in Kubernetes.

Review this deployment YAML for production readiness:
- Resource limits and requests
- Health checks and probes
- Security contexts and policies
- High availability and scaling

[paste YAML]
```

## Iteration workflow

1. **Start simple**: Get a working first pass
2. **Add constraints**: Refine with style, performance, or security requirements
3. **Provide feedback**: If output misses the mark, say why and re‑prompt
4. **Extract patterns**: Save successful prompts as templates

## Measuring prompt quality

Track:
- **Acceptance rate**: How often is the first output usable?
- **Edit distance**: How much do you change the generated code?
- **Iteration count**: How many back‑and‑forths to get it right?

Good prompts have high acceptance, low edits, and few iterations.

## Tools and workflows

- **Prompt libraries**: Save proven templates in a snippets tool or repo
- **Version control**: Track prompt evolution alongside code
- **A/B testing**: Try variations and measure outcomes
- **Logging**: For production AI features, log prompts and outputs for debugging

## When to use (and skip) AI code generation

### Good fits:
- Boilerplate (CRUD handlers, type definitions, configs)
- Test scaffolding
- Data transformations with clear specs
- Documentation from code
- Refactoring with well‑defined rules

### Poor fits:
- Novel algorithms requiring deep domain knowledge
- Security‑critical logic without expert review
- Highly stateful or concurrent systems
- Code that needs to integrate tightly with undocumented internals

## Final thought

Prompt engineering is less about clever tricks and more about clear communication. Treat the model like a junior developer: give context, be specific, provide examples, and review the output carefully. The more you clarify upfront, the better the results—and the faster you ship.
