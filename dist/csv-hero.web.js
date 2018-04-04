!function(t){var e={};function s(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,s),r.l=!0,r.exports}s.m=t,s.c=e,s.d=function(t,e,i){s.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:i})},s.r=function(t){Object.defineProperty(t,"__esModule",{value:!0})},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=3)}([function(t,e,s){"use strict";(function(t){s.d(e,"a",function(){return i});class i{static getEnv(){return"undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==t?t:{}}}}).call(this,s(1))},function(t,e){var s;s=function(){return this}();try{s=s||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(s=window)}t.exports=s},function(t,e,s){"use strict";var i=s(0);class r{get config(){return this._config}get delimiter(){return this._config.delimiter}set delimiter(t){this._config.delimiter=t}get newLine(){return this._config.newLine}set newLine(t){this._config.newLine=t}get quotes(){return this._config.quotes}set quotes(t){this._config.quotes=t}get escape(){return this._config.escape}set escape(t){this._config.escape=t}get comment(){return this._config.comment}get encoding(){return this._config.encoding}get strictSpaces(){return this._config.strictSpaces}get strictQuotes(){return this._config.strictQuotes}get strictRows(){return this._config.strictRows}get rowSize(){return this._config.rowSize}set rowSize(t){this._config.rowSize=t}get skipEmptyRows(){return this._config.skipEmptyRows}get skipEmptyFieldRows(){return this._config.skipEmptyFieldRows}get trimFields(){return this._config.trimFields}get castTypes(){return this._config.castTypes}get mapFields(){return this._config.mapFields}get fieldMapping(){return this._config.fieldMapping}set fieldMapping(t){this._config.fieldMapping=t}get skipHeader(){return this._config.skipHeader}get maxRows(){return this._config.maxRows}get worker(){return this._config.worker}get workerUrl(){return this._config.workerUrl}get ignoreErrors(){return this._config.ignoreErrors}constructor(t){this._config={delimiter:"auto",newLine:"auto",quotes:"auto",escape:"auto",comment:"",encoding:"UTF-8",strictSpaces:!0,strictQuotes:!0,strictRows:!1,trimFields:!1,castTypes:!1,mapFields:!1,fieldMapping:[],rowSize:-1,maxRows:-1,skipHeader:!1,skipEmptyRows:!0,skipEmptyFieldRows:!1,worker:!1,workerUrl:null,ignoreErrors:!1},this.parseConfig(t)}parseConfig(t){for(let e in t)t.hasOwnProperty(e)&&this._config.hasOwnProperty(e)&&(this._config[e]=t[e])}}class n{constructor(t){this._delimiters=[",",";","|","\t"," "],this._newLines=["\r\n","\n","\r"],this._quotes=['"',"'"],this._config=t}detectLineEnding(t){let e="",s=0;for(let i=0;i<this._newLines.length;i++){let r=new RegExp(this._newLines[i],"gm"),n=(t.match(r)||[]).length;s<n&&(s=n,e=this._newLines[i])}return""!==e&&e}detectDelimiter(t){let e=t.substr(0,t.indexOf(this._config.newLine));return this._findBestPattern(e,this._delimiters,"delimiter",",")}detectQuotes(t){let e=t.substr(0,t.indexOf(this._config.newLine));return this._findBestPattern(e,this._quotes,"quotes",'"')}_findBestPattern(t,e){let s=n._processPatterns(e);return this._gatherPatternStatistics(t,s),n._determineBestMatch(s)}static _processPatterns(t){let e=[];for(let s=0;s<t.length;s++)e.push({value:t[s],regexp:new RegExp(t[s],"g"),min:-1,max:-1,sum:0});return e}_gatherPatternStatistics(t,e){let s=t.split(this._config.newLine),i=s.length<100?s.length:100;for(let t=0;t<i;t++)for(let i=0;i<e.length;i++){let r=(s[t].match(e[i].regexp)||[]).length;(e[i].min>r||-1===e[i].min)&&(e[i].min=r),(e[i].max<r||-1===e[i].max)&&(e[i].max=r),e[i].sum+=r}}static _determineBestMatch(t){let e="",s=-1;for(let i=0;i<t.length;i++){let r=t[i].max-t[i].min;(s>r||-1===s)&&(e=t[i].value,s=r)}return e}}class o{get data(){return this._data}get errors(){return this._errors}constructor(t,e){this._spaces=[" ","\t"],this._errors=[],this._data=[],this._reader=t,this._config=e,this._status={isFirstLine:!0,fieldStarted:!1,isQuotedField:!1,waitForDelimiter:!1,hasQuotesPending:!1,stash:"",currentRow:[],currentField:"",currentCharacter:0,lineStart:0,lineCount:0}}async parse(){let t=await this.readChunk(),e=new n(this._config);if(t.trim().length){if("auto"===this._config.newLine){this._config.newLine="\n";let s=e.detectLineEnding(t);!1===s?this._logError({name:"DetectionError",message:"Unable to detect line ending"}):this._config.newLine=s}"auto"===this._config.delimiter&&(this._config.delimiter=e.detectDelimiter(t)),"auto"===this._config.quotes&&(this._config.quotes=e.detectQuotes(t)),"auto"===this._config.escape&&(this._config.escape=this._config.quotes),this._parseText(t)}}async readChunk(){try{return await this._reader.readChunk()}catch(t){this._logError(t)}return""}_logError(t){i.a.getEnv().ProgressEvent&&t instanceof ProgressEvent&&(t=t.target.error),(t instanceof Error||i.a.getEnv().DOMError&&t instanceof DOMError)&&(t={name:t.name,message:t.message}),t.name||(t.name="ParserError"),t.message&&t.message.length||(t.message=t.name),t.character||(t.character=this._status.currentCharacter-this._status.lineStart-1),t.line=this._status.lineCount,this._errors.push(t)}_parseText(t){this._status.lineCount++;for(let e=0;e<t.length;e++){let s=t[e],i=!1;if(this._status.currentCharacter=e,[i,e]=this._checkComment(t,e,s),!(i||([i,e]=this._checkEscapedQuotes(t,e),i||([i,e]=this._checkQuotes(t,e),i||([i,e]=this._checkDelimiter(t,e),i)))))if([i,e]=this._checkNewLine(t,e),i){if(-1!==this._config.maxRows&&this._data.length===this._config.maxRows)return}else this._checkSpaces(s)||(this._handleStash(),this._status.fieldStarted=!0,this._status.currentField+=s)}this._status.currentField&&this._saveField(),this._status.currentRow.length&&this._saveRow(this._status.currentCharacter)}_checkComment(t,e,s){if(this._config.comment===s&&e===this._status.lineStart+1){let s=t.indexOf(this._config.newLine,e);return-1!==s?e+=s-e-1+this._config.newLine.length:e=t.length,this._status.currentRow=[],this._status.currentField="",this._status.lineStart=e,this._status.lineCount++,[!0,e]}return[!1,e]}_handleStash(){this._status.stash&&(this._status.waitForDelimiter&&this._config.strictQuotes&&this._logError({name:"InvalidQuotes",message:"Invalid trailing quote in quoted field"}),this._flushStash())}_flushStash(){this._status.currentField+=this._status.stash,this._status.hasQuotesPending=!1,this._status.waitForDelimiter=!1,this._status.stash=""}_checkSpaces(t){return!(this._config.strictSpaces||-1===this._spaces.indexOf(t)||this._status.fieldStarted&&!this._status.waitForDelimiter)&&(this._status.stash+=t,!0)}_checkEscapedQuotes(t,e){if(!this._status.fieldStarted)return[!1,e];let[s,i]=o._matchesSequence(t,e,this._config.escape+this._config.quotes);return s?(this._status.isQuotedField?this._config.strictQuotes?this._status.currentField+=this._config.quotes:(this._status.stash+=this._config.quotes,this._status.hasQuotesPending=!0,this._status.waitForDelimiter=!0):this._status.currentField+=this._config.escape+this._config.quotes,this._status.fieldStarted=!0,[!0,e+=i]):[!1,e]}_checkQuotes(t,e){let[s,i]=o._matchesSequence(t,e,this._config.quotes);return s?(this._status.fieldStarted&&!this._status.isQuotedField?this._status.currentField+=this._config.quotes:this._status.fieldStarted?(this._status.hasQuotesPending&&this._flushStash(),this._status.waitForDelimiter?this._flushStash():(this._status.stash+=this._config.quotes,this._status.waitForDelimiter=!0)):(this._status.fieldStarted=!0,this._status.isQuotedField=!0),[!0,e+=i]):[!1,e]}_checkDelimiter(t,e){let[s,i]=o._matchesSequence(t,e,this._config.delimiter);return!s||this._status.isQuotedField&&!this._status.waitForDelimiter?[!1,e]:(this._saveField(),[!0,e+=i])}_checkNewLine(t,e){let[s,i]=o._matchesSequence(t,e,this._config.newLine);return!s||this._status.isQuotedField&&!this._status.waitForDelimiter?[!1,e]:(this._saveField(),this._saveRow(e),[!0,e+=i])}_saveField(){this._status.currentRow.push(this._processFieldValue()),this._status.currentField="",this._status.stash="",this._status.fieldStarted=!1,this._status.isQuotedField=!1,this._status.hasQuotesPending=!1,this._status.waitForDelimiter=!1}_processFieldValue(t){let e=this._status.currentField;return this._status.hasQuotesPending&&(e+=this._config.quotes),this._config.trimFields&&(e=e.trim()),this._config.castTypes?o._castValue(t):e}static _castValue(t){return"true"===t.toLowerCase()||"false"!==t.toLowerCase()&&(isNaN(t)?t:parseFloat(t))}_saveRow(t){let e=this._status.currentRow;this._status.currentRow=[],this._status.lineStart=t,this._status.lineCount++,this._config.skipEmptyRows&&(0===e.length||1===e.length&&0===e[0].length)||this._isEmptyFieldRow(e)||(this._checkRowSize(e),this._checkFirstLine(e)||this._data.push(this._mapFields(e)))}_mapFields(t){if(this._config.mapFields){let e={},s=this._config.fieldMapping;for(let i=0;i<t.length;i++)void 0!==s[i]?e[s[i]]=t[i]:e[`field_${i}`]=t[i];return e}return t}_checkFirstLine(t){return this._status.isFirstLine&&this._config.mapFields&&0===this._config.fieldMapping.length?(this._config.fieldMapping=t,this._status.isFirstLine=!1,!0):!(!this._status.isFirstLine||!this._config.skipHeader)&&(this._status.isFirstLine=!1,!0)}_checkRowSize(t){if(-1===this._config.rowSize&&(this._config.rowSize=t.length),this._config.strictRows)if(this._config.rowSize>t.length)for(let e=t.length;e<this._config.rowSize;e++)t.push("");else this._config.rowSize<t.length&&this._logError({name:"InvalidRow",message:"Row size does not match the configured size"})}_isEmptyFieldRow(t){if(this._config.skipEmptyFieldRows){let e=!0;for(let s=0;s<t.length;s++)if(0!==t[s].length){e=!1;break}return e}return!1}static _matchesSequence(t,e,s){let i=s.length;return[t.substr(e,i)===s,i-1]}}class a{constructor(t,e){this._config=e,this._file=t}readChunk(){return new Promise((t,e)=>{let s=new FileReader;s.onload=(()=>{t(s.result)}),s.onerror=e,s.readAsText(this._file,this._config.encoding)})}}class h{constructor(t,e){this._config=e,this._text=t}async readChunk(){return this._text}}s.d(e,"a",function(){return c});class c{constructor(){this._isWorker="undefined"!=typeof WorkerGlobalScope,this._isBrowser="undefined"!=typeof document,!this._isWorker&&this._isBrowser?this._workerUrl=null!==document.currentScript?document.currentScript.src:null:this._isWorker&&(self.onmessage=(t=>{let e=new r(t.data.config);c._runLocal(t.data.file,e,self.postMessage,self.postMessage)}))}parse(t,e={}){return new Promise(async(s,i)=>{let n=new r(e);n.worker&&!this._isWorker&&this._isBrowser?this._runWorker(t,n,s,i):c._runLocal(t,n,s,i).catch(i)})}_runWorker(t,e,s,i){let r=null!==e.workerUrl?e.workerUrl:this._workerUrl;if(!r)throw new Error("Worker URL missing");let n=new Worker(r);n.onmessage=(t=>{let e=t.data;e.hasErrors&&!e.config.ignoreErrors?i(e):s(e)}),n.postMessage({file:t,config:e.config})}static async _runLocal(t,e,s,i){let r=c._getStreamer(t,e),n=new o(r,e);await n.parse(),c._createResult(n,e,s,i)}static _createResult(t,e,s,i){let r={config:e.config,data:t.data,errors:t.errors,hasData:0!==t.data.length,hasErrors:0!==t.errors.length};r.hasErrors&&!r.config.ignoreErrors?i(r):s(r)}static _getStreamer(t,e){return i.a.getEnv().File&&t instanceof File?new a(t,e):new h(t,e)}}},function(t,e,s){"use strict";s.r(e),function(t){var e=s(2);("undefined"!=typeof window?window:t).CsvHero=new e.a}.call(this,s(1))}]);