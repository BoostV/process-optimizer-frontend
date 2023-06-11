# @process-optimizer-frontend/core

## 2.5.0

### Minor Changes

- d78a230: Update and toggle suggested count based on data points and constraints
- 4779ca3: Validate data point inputs

### Patch Changes

- d8188ce: Handle legacy data where numbers in optimizer config is represented as strings
- a8bfdf4: Add star rating to data points

## 2.4.0

### Minor Changes

- 15a6c5e: Add optional external state to message provider, adjust loading skeletons, add missing export

## 2.3.0

### Minor Changes

- 6a09b4a: Add provider for info and error messages

## 2.2.0

### Minor Changes

- a1079a4: Support constraints

### Patch Changes

- Updated dependencies [a1079a4]
- Updated dependencies [4ae497f]
  - @boostv/process-optimizer-frontend-api@1.2.0

## 2.1.0

### Minor Changes

- ebfff31: Add / remove / edit input model variables

### Patch Changes

- aafdfa2: Change calculation of initial points

## 2.0.0

### Major Changes

- d7d66b4: Include type of each value of a data row.

### Patch Changes

- c512d7c: Fix issue where editing breaks after toggling multi objective
- 82b8489: Add selector for multi objective state

## 1.5.0

### Minor Changes

- 92517b0: Enable input model editing when data points are present

### Patch Changes

- b83ec77: Enable/disable datapoints
- 9015ba2: Fix how changedSinceLastEvaluation is calculated
- 47e76d5: Use Faker.js and JSON schema in migration testing

## 1.4.2

### Patch Changes

- 2cdb142: Fix immer externalization

## 1.4.1

### Patch Changes

- 12b13b4: Fix packaging
- Updated dependencies [c49168d]
  - @boostv/process-optimizer-frontend-api@1.1.4

## 1.4.0

### Minor Changes

- f915c8a: Introduce Zod for input validation

## 1.3.4

### Patch Changes

- f432859: Fix build issues
- Updated dependencies [f432859]
  - @boostv/process-optimizer-frontend-api@1.1.3

## 1.3.3

### Patch Changes

- 739e6b8: Revert conversion to tsc and use vite for all packages
- Updated dependencies [739e6b8]
  - @boostv/process-optimizer-frontend-api@1.1.2

## 1.3.2

### Patch Changes

- 58fbac8: Use plain tsc for building packages
- Updated dependencies [58fbac8]
  - @boostv/process-optimizer-frontend-api@1.1.1

## 1.3.1

### Patch Changes

- a0c3d31: Remove bad dispatch call

## 1.3.0

### Minor Changes

- 1acbe02: Add managed experiment provider

## 1.2.0

### Minor Changes

- 842cb41: Support pluggable experiment storage

### Patch Changes

- 123d09d: Fix various minor issues related to API provider
- 53172b5: Minor fix to API provider

## 1.1.0

### Minor Changes

- 054c3d3: Add support for authentication
- 5512e8d: Add validation of data table
- 213462d: Add feature for copying suggested experiments to data points

### Patch Changes

- 1ac0ab2: Request the correct number of suggestions
- Updated dependencies [666eccb]
- Updated dependencies [054c3d3]
- Updated dependencies [1ac0ab2]
  - @boostv/process-optimizer-frontend-api@1.1.0

## 1.0.0

### Patch Changes

- First monorepo release
- Updated dependencies
  - @process-optimizer-frontend/api@1.0.0
