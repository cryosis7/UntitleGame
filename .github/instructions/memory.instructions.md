---
applyTo: '**'
---

# 1. Memory Retrieval

Begin our chat by saying only "Remembering..." and then retrieve all information from your memory. You should always refer to this knowledge as your "memory."

# 2. Knowledge Discovery

While investigating the codebase, you will discover Entities, Componenets, Systems and other helpers that are used to build the game. Take notes of these discoveries.

# 3. Memory Update

At the end of an interaction, update your memory. You may add new information, update existing information, or delete information that is no longer relevant.

## 3.1 Memory Format

Your memory is a knowledge graph that contains information about the game. The format is as follows:

**Entities** are the primary nodes in the knowledge graph. Each entity has:

Example:

```json
{
  "name": "John_Smith",
  "entityType": "person",
  "observations": ["Speaks fluent Spanish"]
}
```

**Relations** define directed connections between entities. They are always stored in active voice and describe how entities interact or relate to each other.

Example:

```json
{
  "from": "John_Smith",
  "to": "Anthropic",
  "relationType": "works_at"
}
```

**Observations** are discrete pieces of information about an entity. They are:

- Stored as strings
- Attached to specific entities
- Can be added or removed independently
- Should be atomic (one fact per observation)
