# ItemInteractionSystem Test Naming Scheme

## Overview

This document provides a standardized naming convention for the `ItemInteractionSystem` tests, moving away from
path-based naming to behavior-focused naming that better represents the business logic and expected outcomes.

## Naming Convention Principles

1. **Behavior-Focused**: Test names should describe what the system does, not internal implementation paths
2. **Given-When-Then Structure**: Implicitly follow "Given [precondition], When [action], Then [expected result]"
3. **Domain Language**: Use game terminology (entities, items, interactions) rather than technical jargon
4. **Specific Outcomes**: Focus on observable behavior changes rather than internal method calls
5. **Concise but Descriptive**: Clear intent without excessive verbosity

## Test Structure and Naming

### Primary Test Groups

#### 1. Interaction Prerequisites

Tests that verify the system correctly handles missing or invalid preconditions.

**Current Problems**:

- "Path 1.1: No Interacting Entities" - focuses on internal path rather than behavior
- "should exit early when no entities have required components" - implementation detail

**Improved Naming**:

```typescript
describe('Interaction Prerequisites', () => {
  describe('when no entities are interacting', () => {
    it('performs no interactions', () => {
    })
    it('leaves all entities unchanged', () => {
    })
  })

  describe('when interacting entity lacks required components', () => {
    it('skips interaction when missing carried item', () => {
    })
    it('skips interaction when missing position', () => {
    })
    it('skips interaction when not flagged as interacting', () => {
    })
  })

  describe('when carried item is invalid', () => {
    it('logs error and continues when item entity does not exist', () => {
    })
    it('skips interaction when item is not usable', () => {
    })
  })
})
```

#### 2. Capability Matching

Tests for item-to-target compatibility logic.

**Current Problems**:

- "Path 2.1: No Matching Capabilities" - internal implementation focus
- Generic capability names don't reflect game context

**Improved Naming**:

```typescript
describe('Item-Target Compatibility', () => {
  describe('when item capabilities do not match target requirements', () => {
    it('ignores incompatible targets', () => {
    })
    it('continues checking other potential targets', () => {
    })
  })

  describe('when item has partial capability match', () => {
    it('rejects targets requiring additional capabilities', () => {
    })
    it('does not interact with partially compatible targets', () => {
    })
  })

  describe('when item fully satisfies target requirements', () => {
    it('includes target in interaction candidates', () => {
    })
    it('processes interaction with compatible target', () => {
    })
  })

  describe('capability edge cases', () => {
    it('handles empty capability requirements', () => {
    })
    it('handles items with excess capabilities', () => {
    })
    it('matches case-sensitive capability names', () => {
    })
  })
})
```

#### 3. Spatial Validation

Tests for position and direction requirements.

**Current Problems**:

- "approachingFromCorrectPositionAndDirection" - method name exposure
- Technical coordinate focus rather than game interaction context

**Improved Naming**:

```typescript
describe('Interaction Positioning', () => {
  describe('when entity is incorrectly positioned', () => {
    it('rejects interaction from invalid positions', () => {
    })
    it('validates adjacent position requirements', () => {
    })
  })

  describe('when entity lacks directional component', () => {
    it('allows interaction from any valid adjacent position', () => {
    })
    it('ignores facing direction for non-directional entities', () => {
    })
  })

  describe('when entity faces wrong direction', () => {
    it('rejects interaction when not facing target', () => {
    })
    it('enforces directional requirements', () => {
    })
  })

  describe('when positioning is correct', () => {
    it('allows interaction when properly positioned and facing target', () => {
    })
    it('works with multiple valid interaction directions', () => {
    })
    it('handles diagonal vs cardinal positioning', () => {
    })
  })
})
```

#### 4. Interaction Behaviors

Tests for the different types of interactions that can occur.

**Current Problems**:

- "processBehaviorTransform" - exposes internal method names
- Behavior types listed as paths rather than game actions

**Improved Naming**:

```typescript
describe('Interaction Outcomes', () => {
  describe('entity transformation', () => {
    it('transforms target into new entity type', () => {
    })
    it('preserves position and core components during transformation', () => {
    })
    it('removes interaction requirements after transformation', () => {
    })
    it('fails when transformation sprite is missing', () => {
    })
  })

  describe('entity removal', () => {
    it('removes target entity from game world', () => {
    })
    it('cleans up all entity references', () => {
    })
  })

  describe('content spawning', () => {
    it('spawns contents at target location', () => {
    })
    it('applies spawn offset when specified', () => {
    })
    it('positions multiple spawned entities appropriately', () => {
    })
    it('removes original entity after spawning contents', () => {
    })
    it('fails when spawn configuration is incomplete', () => {
    })
  })

  describe('behavior configuration errors', () => {
    it('throws error when behavior type is unknown', () => {
    })
    it('throws error when required behavior data is missing', () => {
    })
  })
})
```

#### 5. Item Consumption

Tests for item usage and durability logic.

**Current Problems**:

- "handleItemConsumption" - internal method exposure
- Focus on component manipulation rather than game behavior

**Improved Naming**:

```typescript
describe('Item Usage', () => {
  describe('consumable items', () => {
    it('removes item after successful use', () => {
    })
    it('clears carried item reference after consumption', () => {
    })
    it('handles consumption errors gracefully', () => {
    })
  })

  describe('reusable items', () => {
    it('preserves item after successful use', () => {
    })
    it('maintains carried item reference for reusable items', () => {
    })
  })

  describe('item consumption edge cases', () => {
    it('handles missing carried item component during consumption', () => {
    })
    it('handles item ID mismatch during consumption', () => {
    })
  })
})
```

#### 6. Integration Scenarios

Tests for complete interaction flows combining multiple aspects.

**New Addition** (not present in original):

```typescript
describe('Complete Interaction Flows', () => {
  describe('successful key-chest interaction', () => {
    it('opens chest, consumes key, spawns treasure', () => {
    })
    it('transforms locked chest to open chest', () => {
    })
  })

  describe('tool-machine interaction', () => {
    it('operates machine with correct tool', () => {
    })
    it('preserves reusable tool after operation', () => {
    })
  })

  describe('multi-step interactions', () => {
    it('handles multiple entities interacting simultaneously', () => {
    })
    it('processes interactions in deterministic order', () => {
    })
  })
})
```

#### 7. Error Handling and Edge Cases

Tests for robustness and error conditions.

**Current Problems**:

- Generic "Edge Cases" grouping
- Technical focus on data integrity rather than game robustness

**Improved Naming**:

```typescript
describe('System Robustness', () => {
  describe('data integrity issues', () => {
    it('handles orphaned item references', () => {
    })
    it('recovers from corrupted entity states', () => {
    })
    it('manages concurrent entity modifications', () => {
    })
  })

  describe('boundary conditions', () => {
    it('handles interactions at map edges', () => {
    })
    it('manages overlapping entity positions', () => {
    })
    it('processes large numbers of simultaneous interactions', () => {
    })
  })

  describe('configuration validation', () => {
    it('validates sprite references during transformation', () => {
    })
    it('handles empty spawn content arrays', () => {
    })
    it('manages invalid interaction direction specifications', () => {
    })
  })
})
```

## Implementation Guidelines

### Test Description Format

- **Use active voice**: "removes entity" not "entity is removed"
- **Be specific about outcomes**: "spawns treasure at chest location" not "spawns contents"
- **Focus on observable behavior**: "chest opens" not "removes RequiresItem component"
- **Use game terminology**: "player uses key on chest" not "entity with capability interacts with target"

### Assertion Strategy

- **State verification over method verification**: Check entity states rather than method calls
- **Meaningful test data**: Use "key", "chest", "treasure" instead of generic IDs
- **Clear preconditions**: Set up realistic game scenarios
- **Complete outcome validation**: Verify all expected changes, not just primary effects

### Test Organization

See `./ItemInteractionSystem-testing-hierarchy.md`