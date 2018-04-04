# CSV Hero - The
![CSV Hero](https://github.com/marius-wieschollek/csv-hero/raw/master/demo/CsvHero.svg)

CSV Hero will save your day and handle all the CSV files you have to parse!
CSV Hero can parse your csv files even when no one else can.

## Features
Here is what CSV Hero can do for you:
- Parse CSV with an easy to use api
- Handle different input sources
- Automatically detect line breaks, delimiter and quote style
- Handle badly escaped quotes
- Work in the background as Worker
- Detect numbers and boolean values
- Bring no dependencies

## Installation
Install with NPM
```
npm i csv-hero
```
or build from source
```
git clone https://github.com/marius-wieschollek/csv-hero.git
cd csv-hero
npm install
npm run build
```


## Usage
Using CSV Hero is absolutely easy:
```javascript
// Just parse a csv string
CsvHero.parse('Easy,as,123');

// Parse a user file
let SomeFile = document.getElementById('some-file').files[0];
CsvHero.parse(SomeFile);

// Use some custom options
CsvHero.parse('Easy,as,123', {worker:true});
```

CSV Hero uses Promises:
```javascript
CsvHero.parse('Easy,as,123')
    .then(console.log)
    .catch(console.error);
```


## Parser Options
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| delimiter | string | `auto` | The character used to separate the columns. If the value is `auto`, CSV Hero will try to find the best match. |
| newLine | string | `auto` | The new line character. If the value is `auto`. CSV Hero will try to find the best match and default to `\n` if he can't. |
| quotes | string | `auto` | The quote character used to encapsulate fields. If the value is `auto`, CSV Hero will try to find the best match. |
| escape | string | `auto` | The escape character used to escape the quote character inside a quoted field. If the value is `auto`, CSV Hero will use the same as the quote character. |
| comment | string | - | The comment character. If a line is prefixed with this character, it will be ignored. Usually empty to disable quotes. |
| encoding | string | `UTF-8` | If you pass a file to CSV Hero, you can specify the encoding. |
| strictSpaces | boolean | `true` | Defines how CSV Hero handles spaces before the first and after the last quote in a field. See [Strict Spaces Option](#strict-spaces-option) for details. |
| strictQuotes | boolean | `true` | Defines how CSV Hero handles quotes. If it is disabled, will try to detect badly escaped quotes. See [Strict Quotes Option](#strict-quotes-option) for details. |
| strictRows | boolean | `false` | If this option is enabled, CSV Hero will guarantee a minimum row size and report an error for rows that have too many columns. |
| rowSize | number | `-1` | Sets the deisred row size for `strictRows`. If the value is `-1`, the size of the first row will be used as reference. The detection will ignore `skipHeader`. |
| maxRows | number | `-1` | If set to any value except -1, CSV Hero will parse after the given amount of rows were parsed. `skipEmptyRows`, `skipEmptyFieldRows` and `skipHeader` will be respected. |
| skipHeader | boolean | `false` | Skip the first row which is usually used as header. `skipEmptyRows` and `skipEmptyFieldRows` will be respected. |
| skipEmptyRows | boolean | `false` | Skip rows with no values at all. |
| skipEmptyFieldRows | boolean | `false` | Skips rows with only empty fields. See `trimFields` if you want to include fields with only spaces too. |
| trimFields | boolean | `false` | Trim spaces at the beginning and end of a value. This is a post processing filter and hass no effect on `strictSpaces`. |
| castTypes | boolean | `false` | Detect numbers and booleans and convert them to their native type. |
| mapFields | boolean | `false` | Map colums to a field name instead of creating an array with the values. |
| fieldMapping | array | `[]` | The property names for `mapFields`. If it is left empty, the header row will be used. Extra fields will be named `field_<index>`. |
| worker | boolean | `false` | Run all jobs as a WebWorker. Workers run in the background and will prevent your site from becoming unresponsive. |
| workerUrl | string|null | null | If needed you may set the worker url here (URL to the CSV Hero script). If you embedded CSV Hero as standalone script you may not need this. |
| ignoreErrors | boolean | `false` | Ignore if errors occur and always trigger the success function. |

### Strict Spaces Option
By default, CSV Hero will enforce standards compliant behaviour and consider spaces at the beginning and at the end of a column as part of the content.
In some cases that may not be wanted. See the following example:

```csv
Column 1,Column 2,Column 3
"Value 1" , "Value 2" , "Value 3"
```

With `strictSpaces` enabled, an error may be logged and the result will look like this:

| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| `Value 1" , "Value 2" , "Value 3` | | |

With `strictSpaces` disabled, the result will look like this:

| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| `Value 1` | `Value 2` | `Value 3` |

With `strictSpaces` disabled, CSV Hero will ignore the spaces around the values in the second line as long as it finds a delimiter at some point


### Strict Quotes Option
By default, CSV Hero will enforce standards compliant behaviour and report an error if an unescaped quote character is found, but no delimiter follows.
Sometimes you may have to parse csv files where quotes were not escaped properly. Take the content below as example:

```csv
Column 1,Column 2
"Oops, some bad "Quotes"","What could go wrong?"
```

With `strictQuotes` enabled, an error will be reported and the result will look like this:

| Column 1 | Column 2 |
| --- | --- |
| `Oops, some bad "Quotes","What could go wrong?` | |

With `strictQuotes` disabled, the result will look like this:

| Column 1 | Column 2 |
| --- | --- |
| `Oops, some bad "Quotes"` | `What could go wrong?` |

With `strictQuotes` disabled, CSV Hero will try to determine if a quote is used as field start, content ur in combination with the delimiter as field end.
However especially the field endings are very hard to detect, and it may happen that CSV Hero detects the quote + delimiter combination inside a field.
See this example:

```csv
JSON
"{"well":"that","sucks":"now"}"
"{""well"":""that"",""sucks"":""now""}"
```

The commas in the json string will look exactly like a field delimiter and therefore counted as one. even the correctly encoded third line will be an issue now:

| JSON | |
| --- | --- |
| `{"well":"that` | `sucks":"now"}` |
| `{"well":"that"` | `"sucks":"now"}` |

We tried our best, but sometimes even a hero can't save you from CSV hell. Therefore we recommend you use this option with caution.