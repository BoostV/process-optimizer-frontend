# Changelog

## [v1.6.3](https://github.com/BoostV/process-optimizer-frontend/tree/v1.6.3)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.6.2...v1.6.3)

**Implemented enhancements:**

- Interactive visualizations [\#142](https://github.com/BoostV/process-optimizer-frontend/issues/142)

**Fixed bugs:**

- Categorical parameter missing in the model card [\#200](https://github.com/BoostV/process-optimizer-frontend/issues/200)
- Case sensitivity on csv-import [\#199](https://github.com/BoostV/process-optimizer-frontend/issues/199)
- Properly fix routing when hosting in nginx [\#188](https://github.com/BoostV/process-optimizer-frontend/issues/188)

**Closed issues:**

- Migrate to Vite.js [\#197](https://github.com/BoostV/process-optimizer-frontend/issues/197)
- Update MUI inputs to outlined [\#184](https://github.com/BoostV/process-optimizer-frontend/issues/184)

**Merged pull requests:**

- Separate into application and library module [\#209](https://github.com/BoostV/process-optimizer-frontend/pull/209) ([langdal](https://github.com/langdal))
- Migrate to Vite.js [\#207](https://github.com/BoostV/process-optimizer-frontend/pull/207) ([langdal](https://github.com/langdal))
- Case insensitivity csv-import of meta data field "enabled" [\#203](https://github.com/BoostV/process-optimizer-frontend/pull/203) ([langdal](https://github.com/langdal))
- fix: revert "Resolve lint issues" [\#202](https://github.com/BoostV/process-optimizer-frontend/pull/202) ([langdal](https://github.com/langdal))
- fix: apply workaround for volume mounts [\#201](https://github.com/BoostV/process-optimizer-frontend/pull/201) ([langdal](https://github.com/langdal))
- Embed-bokeh-plot [\#198](https://github.com/BoostV/process-optimizer-frontend/pull/198) ([langdal](https://github.com/langdal))
- Add sample data [\#190](https://github.com/BoostV/process-optimizer-frontend/pull/190) ([langdal](https://github.com/langdal))

## [v1.6.2](https://github.com/BoostV/process-optimizer-frontend/tree/v1.6.2) (2022-09-01)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.6.1...v1.6.2)

**Implemented enhancements:**

- Change "Xi" to "Desired further improvement" [\#185](https://github.com/BoostV/process-optimizer-frontend/issues/185)
- Assign meta data to each data point \(numbering of experiments\) [\#138](https://github.com/BoostV/process-optimizer-frontend/issues/138)

**Merged pull requests:**

- 138 assign meta data to each data point numbering of experiments [\#189](https://github.com/BoostV/process-optimizer-frontend/pull/189) ([langdal](https://github.com/langdal))
- Change Xi to descriptive text [\#187](https://github.com/BoostV/process-optimizer-frontend/pull/187) ([langdal](https://github.com/langdal))
- Optimize Github CI actions [\#186](https://github.com/BoostV/process-optimizer-frontend/pull/186) ([langdal](https://github.com/langdal))
- Set MUI input variant defaults [\#183](https://github.com/BoostV/process-optimizer-frontend/pull/183) ([j-or](https://github.com/j-or))
- Maintenance/reducer restructure [\#182](https://github.com/BoostV/process-optimizer-frontend/pull/182) ([langdal](https://github.com/langdal))

## [v1.6.1](https://github.com/BoostV/process-optimizer-frontend/tree/v1.6.1) (2022-07-09)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.6.0...v1.6.1)

**Fixed bugs:**

- During initialization don't send data points to backend [\#178](https://github.com/BoostV/process-optimizer-frontend/issues/178)

**Closed issues:**

- Remove edit icon on initialization view [\#179](https://github.com/BoostV/process-optimizer-frontend/issues/179)

**Merged pull requests:**

- 178 during initialization dont send data points to backend [\#181](https://github.com/BoostV/process-optimizer-frontend/pull/181) ([langdal](https://github.com/langdal))
- Remove edit icon on intialization view [\#180](https://github.com/BoostV/process-optimizer-frontend/pull/180) ([langdal](https://github.com/langdal))

## [v1.6.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.6.0) (2022-07-07)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.5.0...v1.6.0)

**Implemented enhancements:**

- 167 change default acquisition model [\#177](https://github.com/BoostV/process-optimizer-frontend/pull/177) ([langdal](https://github.com/langdal))
- Feature/advanced configuration [\#176](https://github.com/BoostV/process-optimizer-frontend/pull/176) ([langdal](https://github.com/langdal))
- 159 number of initial experiments should be dynamically calculated [\#173](https://github.com/BoostV/process-optimizer-frontend/pull/173) ([langdal](https://github.com/langdal))
- Hide model configuration until n initial experiments [\#172](https://github.com/BoostV/process-optimizer-frontend/pull/172) ([langdal](https://github.com/langdal))
- Prepend "/" to experiment paths [\#162](https://github.com/BoostV/process-optimizer-frontend/pull/162) ([lasseborly](https://github.com/lasseborly))

**Closed issues:**

- Use Immer in reducer to simplify state updates [\#174](https://github.com/BoostV/process-optimizer-frontend/issues/174)
- Upgrade to react 18 [\#170](https://github.com/BoostV/process-optimizer-frontend/issues/170)
- Change default acquisition model [\#167](https://github.com/BoostV/process-optimizer-frontend/issues/167)
- Hide model configuration until N initial experiments are run [\#164](https://github.com/BoostV/process-optimizer-frontend/issues/164)
- Implement expandable table rows for data points [\#163](https://github.com/BoostV/process-optimizer-frontend/issues/163)
- Number of initial experiments should be dynamically calculated [\#159](https://github.com/BoostV/process-optimizer-frontend/issues/159)
- Migrate from material-ui to mui [\#157](https://github.com/BoostV/process-optimizer-frontend/issues/157)
- Declutter interface by introducing activity focus mode \(Tabs and summaries\) [\#155](https://github.com/BoostV/process-optimizer-frontend/issues/155)
- Maintenance: Enable Typescript "strict" mode [\#152](https://github.com/BoostV/process-optimizer-frontend/issues/152)
- Move expected minimum into its own card [\#133](https://github.com/BoostV/process-optimizer-frontend/issues/133)

**Merged pull requests:**

- 174 use immer in reducer to simplify state updates [\#175](https://github.com/BoostV/process-optimizer-frontend/pull/175) ([langdal](https://github.com/langdal))
- Upgrade to react 18 [\#171](https://github.com/BoostV/process-optimizer-frontend/pull/171) ([langdal](https://github.com/langdal))
- Maintenance/157 migrate from material UI to mui [\#169](https://github.com/BoostV/process-optimizer-frontend/pull/169) ([langdal](https://github.com/langdal))
- Feature/163 implement expandable table rows for data points [\#168](https://github.com/BoostV/process-optimizer-frontend/pull/168) ([j-or](https://github.com/j-or))
- Maintenance: Update OpenAPI tools and parsing [\#165](https://github.com/BoostV/process-optimizer-frontend/pull/165) ([langdal](https://github.com/langdal))
- Feature/155 tabs example implementation of simple tab mechanism [\#158](https://github.com/BoostV/process-optimizer-frontend/pull/158) ([langdal](https://github.com/langdal))
- Maintenance/152 maintenance enable typescript strict mode [\#153](https://github.com/BoostV/process-optimizer-frontend/pull/153) ([langdal](https://github.com/langdal))

## [v1.5.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.5.0) (2022-04-28)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.4.1...v1.5.0)

**Implemented enhancements:**

- Migrate API paths to client side logic [\#150](https://github.com/BoostV/process-optimizer-frontend/issues/150)
- Remove server side storage [\#149](https://github.com/BoostV/process-optimizer-frontend/issues/149)
- Copy or overwrite experiment [\#130](https://github.com/BoostV/process-optimizer-frontend/issues/130)
- Move API interaction to client [\#154](https://github.com/BoostV/process-optimizer-frontend/pull/154) ([lasseborly](https://github.com/lasseborly))
- Feature/add "Create or Overwrite experiment" dialog [\#147](https://github.com/BoostV/process-optimizer-frontend/pull/147) ([lasseborly](https://github.com/lasseborly))

**Closed issues:**

- Update Next.JS and dependencies [\#144](https://github.com/BoostV/process-optimizer-frontend/issues/144)

**Merged pull requests:**

- Remove server side storage [\#151](https://github.com/BoostV/process-optimizer-frontend/pull/151) ([langdal](https://github.com/langdal))
- Bump ansi-regex from 3.0.0 to 3.0.1 [\#146](https://github.com/BoostV/process-optimizer-frontend/pull/146) ([dependabot[bot]](https://github.com/apps/dependabot))
- 144 update nextjs and dependencies [\#145](https://github.com/BoostV/process-optimizer-frontend/pull/145) ([langdal](https://github.com/langdal))

## [v1.4.1](https://github.com/BoostV/process-optimizer-frontend/tree/v1.4.1) (2022-03-29)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.4.0...v1.4.1)

**Fixed bugs:**

- Conversion error in multi-objective preview feature  [\#143](https://github.com/BoostV/process-optimizer-frontend/issues/143)

## [v1.4.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.4.0) (2022-03-29)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.3.3...v1.4.0)

**Fixed bugs:**

- Upload of .csv file results in "experiment run fail" with Decimal symbol is set to "," [\#137](https://github.com/BoostV/process-optimizer-frontend/issues/137)

**Closed issues:**

- Input validation mechanism [\#121](https://github.com/BoostV/process-optimizer-frontend/issues/121)

**Merged pull requests:**

- Refactor/code format [\#141](https://github.com/BoostV/process-optimizer-frontend/pull/141) ([langdal](https://github.com/langdal))
- Feature/multi objective [\#140](https://github.com/BoostV/process-optimizer-frontend/pull/140) ([langdal](https://github.com/langdal))
- Feature/validation [\#131](https://github.com/BoostV/process-optimizer-frontend/pull/131) ([j-or](https://github.com/j-or))

## [v1.3.3](https://github.com/BoostV/process-optimizer-frontend/tree/v1.3.3) (2022-02-08)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.3.2...v1.3.3)

**Fixed bugs:**

- Input panel is critially broken [\#135](https://github.com/BoostV/process-optimizer-frontend/issues/135)

**Merged pull requests:**

- Parse min and max on submit [\#136](https://github.com/BoostV/process-optimizer-frontend/pull/136) ([langdal](https://github.com/langdal))

## [v1.3.2](https://github.com/BoostV/process-optimizer-frontend/tree/v1.3.2) (2022-01-18)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.3.1...v1.3.2)

**Fixed bugs:**

- Variable inputs have numbers but are empty when submitted [\#129](https://github.com/BoostV/process-optimizer-frontend/issues/129)
- Variable limits not reset during input space definition [\#128](https://github.com/BoostV/process-optimizer-frontend/issues/128)

**Closed issues:**

- Place objective plot above convergence plot [\#125](https://github.com/BoostV/process-optimizer-frontend/issues/125)

**Merged pull requests:**

- Bug/reset inputs on submit [\#127](https://github.com/BoostV/process-optimizer-frontend/pull/127) ([j-or](https://github.com/j-or))
- Feature/place objective plot top [\#126](https://github.com/BoostV/process-optimizer-frontend/pull/126) ([j-or](https://github.com/j-or))

## [v1.3.1](https://github.com/BoostV/process-optimizer-frontend/tree/v1.3.1) (2021-09-25)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.3.0...v1.3.1)

**Fixed bugs:**

- New experiments are not stored in local storage [\#119](https://github.com/BoostV/process-optimizer-frontend/issues/119)

**Merged pull requests:**

- Store experiment id in global state [\#120](https://github.com/BoostV/process-optimizer-frontend/pull/120) ([langdal](https://github.com/langdal))

## [v1.3.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.3.0) (2021-09-24)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.2.0...v1.3.0)

**Implemented enhancements:**

- Stored JSON data should be migratable [\#17](https://github.com/BoostV/process-optimizer-frontend/issues/17)
- Expose expected\_minimum including standard deviation in the frontend [\#106](https://github.com/BoostV/process-optimizer-frontend/issues/106)
- Support sending arbitrary data to API backend [\#76](https://github.com/BoostV/process-optimizer-frontend/issues/76)
- Bulk import of data [\#69](https://github.com/BoostV/process-optimizer-frontend/issues/69)
- Too many significant digits when suggesting next experiment [\#59](https://github.com/BoostV/process-optimizer-frontend/issues/59)

**Fixed bugs:**

- Migration is not run correctly when using local storage [\#115](https://github.com/BoostV/process-optimizer-frontend/issues/115)
- Post size limit 1 mb [\#113](https://github.com/BoostV/process-optimizer-frontend/issues/113)
- Factor min/max values are rounded to zero and break client [\#110](https://github.com/BoostV/process-optimizer-frontend/issues/110)
- Discrete variables send before continuous variables to API [\#87](https://github.com/BoostV/process-optimizer-frontend/issues/87)
- Handle table overflow [\#84](https://github.com/BoostV/process-optimizer-frontend/issues/84)
- Enterring floats ending on .0 in the frontend returns integer value to the backend [\#78](https://github.com/BoostV/process-optimizer-frontend/issues/78)
- Large plot images are not displayed correctly [\#70](https://github.com/BoostV/process-optimizer-frontend/issues/70)
- Changed calculateSpace to fix order of discrete and continuous variables [\#88](https://github.com/BoostV/process-optimizer-frontend/pull/88) ([AkselObdrup](https://github.com/AkselObdrup))

**Closed issues:**

- Help text for plots and metrics [\#9](https://github.com/BoostV/process-optimizer-frontend/issues/9)
- Simple UI for defining all factors in one screen [\#3](https://github.com/BoostV/process-optimizer-frontend/issues/3)
- Requesting more than one experiment at a time [\#11](https://github.com/BoostV/process-optimizer-frontend/issues/11)

**Merged pull requests:**

- Bugfix/missing migration [\#116](https://github.com/BoostV/process-optimizer-frontend/pull/116) ([langdal](https://github.com/langdal))
- Increase body size limit to 100 mb [\#114](https://github.com/BoostV/process-optimizer-frontend/pull/114) ([j-or](https://github.com/j-or))
- Bump tmpl from 1.0.4 to 1.0.5 [\#109](https://github.com/BoostV/process-optimizer-frontend/pull/109) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ws from 7.4.3 to 7.5.5 [\#105](https://github.com/BoostV/process-optimizer-frontend/pull/105) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump glob-parent from 5.1.1 to 5.1.2 [\#104](https://github.com/BoostV/process-optimizer-frontend/pull/104) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump path-parse from 1.0.6 to 1.0.7 [\#103](https://github.com/BoostV/process-optimizer-frontend/pull/103) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump ws from 7.4.3 to 7.5.4 [\#102](https://github.com/BoostV/process-optimizer-frontend/pull/102) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump glob-parent from 5.1.1 to 5.1.2 [\#101](https://github.com/BoostV/process-optimizer-frontend/pull/101) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump normalize-url from 4.5.0 to 4.5.1 [\#100](https://github.com/BoostV/process-optimizer-frontend/pull/100) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump path-parse from 1.0.6 to 1.0.7 [\#99](https://github.com/BoostV/process-optimizer-frontend/pull/99) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump next from 10.2.0 to 11.1.1 [\#98](https://github.com/BoostV/process-optimizer-frontend/pull/98) ([dependabot[bot]](https://github.com/apps/dependabot))
- Langdal/review [\#97](https://github.com/BoostV/process-optimizer-frontend/pull/97) ([langdal](https://github.com/langdal))
- Feature/handle table overflow [\#96](https://github.com/BoostV/process-optimizer-frontend/pull/96) ([j-or](https://github.com/j-or))
- Feature/migration [\#95](https://github.com/BoostV/process-optimizer-frontend/pull/95) ([j-or](https://github.com/j-or))
- Feature/remove plots and pickled from editor [\#92](https://github.com/BoostV/process-optimizer-frontend/pull/92) ([j-or](https://github.com/j-or))
- Add option to explicitly set value as discrete or continuous [\#91](https://github.com/BoostV/process-optimizer-frontend/pull/91) ([j-or](https://github.com/j-or))
- Test variable order of space converter [\#89](https://github.com/BoostV/process-optimizer-frontend/pull/89) ([j-or](https://github.com/j-or))
- Help text for plots and width of plots [\#86](https://github.com/BoostV/process-optimizer-frontend/pull/86) ([AkselObdrup](https://github.com/AkselObdrup))
- Feature/discrete continuous simple [\#85](https://github.com/BoostV/process-optimizer-frontend/pull/85) ([j-or](https://github.com/j-or))
- Feature/refactor next experiments [\#83](https://github.com/BoostV/process-optimizer-frontend/pull/83) ([j-or](https://github.com/j-or))
- Adjust bee theme [\#82](https://github.com/BoostV/process-optimizer-frontend/pull/82) ([j-or](https://github.com/j-or))
- Feature/request more experiments [\#80](https://github.com/BoostV/process-optimizer-frontend/pull/80) ([langdal](https://github.com/langdal))
- Fix variable rounding error [\#111](https://github.com/BoostV/process-optimizer-frontend/pull/111) ([j-or](https://github.com/j-or))
- Accept expected\_minimum in JSON result [\#108](https://github.com/BoostV/process-optimizer-frontend/pull/108) ([langdal](https://github.com/langdal))
- Update dependencies [\#107](https://github.com/BoostV/process-optimizer-frontend/pull/107) ([langdal](https://github.com/langdal))
- Feature/bulk data import export [\#93](https://github.com/BoostV/process-optimizer-frontend/pull/93) ([AkselObdrup](https://github.com/AkselObdrup))
- Move components and styles into folders, remove extra padding from plots [\#90](https://github.com/BoostV/process-optimizer-frontend/pull/90) ([j-or](https://github.com/j-or))

## [v1.2.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.2.0) (2021-06-18)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.1.0...v1.2.0)

## [v1.1.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.1.0) (2021-06-18)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.1.1...v1.1.0)

## [v1.1.1](https://github.com/BoostV/process-optimizer-frontend/tree/v1.1.1) (2021-06-18)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.0.1...v1.1.1)

**Implemented enhancements:**

- Accept extra data returned from API [\#74](https://github.com/BoostV/process-optimizer-frontend/issues/74)
-  Configurable location of backend [\#73](https://github.com/BoostV/process-optimizer-frontend/issues/73)
- Reverse the order of data points [\#38](https://github.com/BoostV/process-optimizer-frontend/issues/38)

**Fixed bugs:**

- The dropzone SVG icon does not apply style in production [\#35](https://github.com/BoostV/process-optimizer-frontend/issues/35)

**Closed issues:**

- JSON editor [\#66](https://github.com/BoostV/process-optimizer-frontend/issues/66)
- Change icon [\#63](https://github.com/BoostV/process-optimizer-frontend/issues/63)

**Merged pull requests:**

- Add extras field to API request [\#77](https://github.com/BoostV/process-optimizer-frontend/pull/77) ([langdal](https://github.com/langdal))
- Bugfix/openapi [\#75](https://github.com/BoostV/process-optimizer-frontend/pull/75) ([langdal](https://github.com/langdal))
- Feature/json editor [\#67](https://github.com/BoostV/process-optimizer-frontend/pull/67) ([j-or](https://github.com/j-or))
- Feature/change icon [\#65](https://github.com/BoostV/process-optimizer-frontend/pull/65) ([j-or](https://github.com/j-or))
- Feature/reverse data points [\#62](https://github.com/BoostV/process-optimizer-frontend/pull/62) ([j-or](https://github.com/j-or))
- The dropzone SVG icon does not apply style in production \#35 [\#60](https://github.com/BoostV/process-optimizer-frontend/pull/60) ([j-or](https://github.com/j-or))

## [v1.0.1](https://github.com/BoostV/process-optimizer-frontend/tree/v1.0.1) (2021-05-12)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.0.0...v1.0.1)

**Fixed bugs:**

- Data points do not update when model is updated [\#57](https://github.com/BoostV/process-optimizer-frontend/issues/57)

**Merged pull requests:**

- Feature/update data points on model update [\#58](https://github.com/BoostV/process-optimizer-frontend/pull/58) ([j-or](https://github.com/j-or))

## [v1.0.0](https://github.com/BoostV/process-optimizer-frontend/tree/v1.0.0) (2021-05-11)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/v1.0.0-alpha...v1.0.0)

**Implemented enhancements:**

- Display clear error when json upload fails [\#44](https://github.com/BoostV/process-optimizer-frontend/issues/44)
- Display feedback when running an experiment [\#40](https://github.com/BoostV/process-optimizer-frontend/issues/40)
- Adjust experiment page when in local storage mode [\#39](https://github.com/BoostV/process-optimizer-frontend/issues/39)
- Allow the user to delete experiments from localStorage [\#37](https://github.com/BoostV/process-optimizer-frontend/issues/37)
- Save JSON on local disk [\#26](https://github.com/BoostV/process-optimizer-frontend/issues/26)
- Show version information in UI [\#20](https://github.com/BoostV/process-optimizer-frontend/issues/20)

**Fixed bugs:**

- Missing logo [\#34](https://github.com/BoostV/process-optimizer-frontend/issues/34)

**Closed issues:**

- Adjust layout to give plots more space [\#55](https://github.com/BoostV/process-optimizer-frontend/issues/55)
- Add multiple colour themes [\#52](https://github.com/BoostV/process-optimizer-frontend/issues/52)

**Merged pull requests:**

- Feature/adjust plots layout [\#56](https://github.com/BoostV/process-optimizer-frontend/pull/56) ([j-or](https://github.com/j-or))
- Feature/multiple themes [\#54](https://github.com/BoostV/process-optimizer-frontend/pull/54) ([j-or](https://github.com/j-or))
- Always add initial state [\#53](https://github.com/BoostV/process-optimizer-frontend/pull/53) ([langdal](https://github.com/langdal))
- Feature/feedback on run [\#51](https://github.com/BoostV/process-optimizer-frontend/pull/51) ([j-or](https://github.com/j-or))
- Feaature/hide debug switch [\#50](https://github.com/BoostV/process-optimizer-frontend/pull/50) ([langdal](https://github.com/langdal))
- Bug/missing logo [\#49](https://github.com/BoostV/process-optimizer-frontend/pull/49) ([j-or](https://github.com/j-or))
- Feature/upload error msg [\#48](https://github.com/BoostV/process-optimizer-frontend/pull/48) ([j-or](https://github.com/j-or))
- Bump hosted-git-info from 2.8.8 to 2.8.9 [\#47](https://github.com/BoostV/process-optimizer-frontend/pull/47) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.20 to 4.17.21 [\#46](https://github.com/BoostV/process-optimizer-frontend/pull/46) ([dependabot[bot]](https://github.com/apps/dependabot))
- Feature/save to local file [\#45](https://github.com/BoostV/process-optimizer-frontend/pull/45) ([langdal](https://github.com/langdal))
- Remove update button from config, hide dirty state when using local s… [\#43](https://github.com/BoostV/process-optimizer-frontend/pull/43) ([j-or](https://github.com/j-or))
- Feature/inject version [\#42](https://github.com/BoostV/process-optimizer-frontend/pull/42) ([langdal](https://github.com/langdal))
- Feature/delete from local storage [\#41](https://github.com/BoostV/process-optimizer-frontend/pull/41) ([j-or](https://github.com/j-or))

## [v1.0.0-alpha](https://github.com/BoostV/process-optimizer-frontend/tree/v1.0.0-alpha) (2021-05-07)

[Full Changelog](https://github.com/BoostV/process-optimizer-frontend/compare/d7819b884d02c9015fd97f775506178a5b571053...v1.0.0-alpha)

**Implemented enhancements:**

- Prevent model editing when data points exist [\#29](https://github.com/BoostV/process-optimizer-frontend/issues/29)
- Welcome page [\#28](https://github.com/BoostV/process-optimizer-frontend/issues/28)
- Let user upload JSON [\#27](https://github.com/BoostV/process-optimizer-frontend/issues/27)
- Store JSON in local storage [\#25](https://github.com/BoostV/process-optimizer-frontend/issues/25)
- Add dropdown for categorical variable data points [\#23](https://github.com/BoostV/process-optimizer-frontend/issues/23)
- Move variable creation to model [\#21](https://github.com/BoostV/process-optimizer-frontend/issues/21)
- Implement functional equivalent to existing optimizer [\#14](https://github.com/BoostV/process-optimizer-frontend/issues/14)
- Option to edit data point values \(experiment results\) [\#7](https://github.com/BoostV/process-optimizer-frontend/issues/7)
- Simple persistence of experiment [\#1](https://github.com/BoostV/process-optimizer-frontend/issues/1)

**Merged pull requests:**

- Feature/welcome page [\#36](https://github.com/BoostV/process-optimizer-frontend/pull/36) ([j-or](https://github.com/j-or))
- Add file upload to home component [\#33](https://github.com/BoostV/process-optimizer-frontend/pull/33) ([j-or](https://github.com/j-or))
- Docker automation [\#32](https://github.com/BoostV/process-optimizer-frontend/pull/32) ([langdal](https://github.com/langdal))
- Feature/context based reducer [\#31](https://github.com/BoostV/process-optimizer-frontend/pull/31) ([langdal](https://github.com/langdal))
- Prevent model edits when data points exist, make tables more dense [\#30](https://github.com/BoostV/process-optimizer-frontend/pull/30) ([j-or](https://github.com/j-or))
- Feature/editable data points [\#24](https://github.com/BoostV/process-optimizer-frontend/pull/24) ([j-or](https://github.com/j-or))
- Move variable creation to model, adjust styling and layout, add app bar [\#22](https://github.com/BoostV/process-optimizer-frontend/pull/22) ([j-or](https://github.com/j-or))
- Update README.md [\#18](https://github.com/BoostV/process-optimizer-frontend/pull/18) ([sqbl](https://github.com/sqbl))
- Bump ssri from 6.0.1 to 6.0.2 [\#16](https://github.com/BoostV/process-optimizer-frontend/pull/16) ([dependabot[bot]](https://github.com/apps/dependabot))
- Feature/functional equivalent [\#15](https://github.com/BoostV/process-optimizer-frontend/pull/15) ([j-or](https://github.com/j-or))
- Bump elliptic from 6.5.3 to 6.5.4 [\#13](https://github.com/BoostV/process-optimizer-frontend/pull/13) ([dependabot[bot]](https://github.com/apps/dependabot))
- Add support for loading experiments [\#2](https://github.com/BoostV/process-optimizer-frontend/pull/2) ([langdal](https://github.com/langdal))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
