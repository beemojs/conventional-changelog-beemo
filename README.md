# conventional-changelog-beemo

[![Build Status](https://travis-ci.org/milesj/conventional-changelog-beemo.svg?branch=master)](https://travis-ci.org/milesj/conventional-changelog-beemo)
[![npm version](https://badge.fury.io/js/conventional-changelog-beemo.svg)](https://www.npmjs.com/package/conventional-changelog-beemo)
[![npm deps](https://david-dm.org/milesj/conventional-changelog-beemo.svg)](https://www.npmjs.com/package/conventional-changelog-beemo)

> [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) >
> [beemo](https://github.com/beemojs/beemo) preset

Beemo's commit message guidelines and changelog structure.

## Commit Message Format

The commit message format consists of a **type**, optional **scope**, and a **message**:

```
<type>: <message>
<type>(<scope>): <message>
```

### Type

The type is a way to group commits and flag semver changes. The following types must be used when
prefixing your commit message.

#### Major

- `break` - A _major_ breaking change.
- `release` - Not a breaking change but bumps the _major_ version.

#### Minor

- `new` - Introduces a new feature.
- `update` - Updates an existing feature.
- `feature` - Both a new and update.

#### Patch

- `fix` - Fixes existing functionality.
- `docs` - Updates documentation.
- `style` - Updates visual styles, like CSS.
- `security` - Improves security.
- `revert` - Reverts previous or broken code.
- `misc` - Catch all for commits that don't align with other types.

#### Skip

- `ci` - Changes to the CI pipeline.
- `build` - Changes to the build system.
- `test` - Changes to tests or the testing framework.
- `internal` - Internal changes not critical for the consumer.

### Scope

The scope is optional but useful in defining granularity in a commit message. Scope is ideally used
to target a specific feature or module within the project, for example:
`new(Button): Add a new Button component`.

Scopes will appear in the changelog before each line item.

### Message

The message contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes".
- Capitalize first letter of message.
- Trailing punctuation (period) is not required.

## Example

Given the following commit messages:

```
new(Button): Add new Button component
update(Model): Refactor accessibility support
ci: Add DangerJS to pipeline
test: Add missing tests for a handful of files
fix(auth): Fixed a bug with the authentication flow
```

Would generate the following changelog:

---

## 1.2.3 - 2019-01-01

#### 🚀 Updates

- **[Button]** Add new Button component ([a1b2c3d][fake-commit])
- **[Modal]** Refactor accessibility support ([a1b2c3d][fake-commit])

#### 🐞 Fixed

- **[auth]** Fixed a bug with the authentication flow ([a1b2c3d][fake-commit])

#### 🛠 Internals

- Add DangerJS to pipeline ([a1b2c3d][fake-commit])
- Add missing tests for a handful of files ([a1b2c3d][fake-commit])

[fake-commit]: #example
