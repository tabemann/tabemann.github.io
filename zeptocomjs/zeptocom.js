// Copyright (c) 2022 Travis Bemann
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

let termTabs = [];
let currentTermTab = null;
let termTabCount = 0;
// let ackCount = 0;
// let nakCount = 0;
// let interruptCount = 0;
// let lostCount = 0;
let workingDir = null;
// let term = null;
// let port = null;
let history = [];
let currentHistoryIdx = 0;
// let okCount = 0;
let globalSymbols = new Map();
// let currentData = [];
// let triggerClose = false;
// let triggerAbort = false;
// let portReader = null;
// let portWriter = null;
// let sending = null;
// let receiving = null;
let currentEditTab = null;
let editTabs = [];
let editTabCount = 0;
let currentSelection = new Map();
let editTabFileName = new Map();
let editTabOrigName = new Map();

function delay(ms) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, ms);
    })
}

function saveConnectParams(termTab) {
    const baudSelect = document.getElementById('baud');
    const dataBitsSelect = document.getElementById('dataBits');
    const stopBitsSelect = document.getElementById('stopBits');
    const paritySelect = document.getElementById('parity');
    const flowControlSelect = document.getElementById('flowControl');
    const targetTypeSelect = document.getElementById('targetType');
    const newlineModeSelect = document.getElementById('newlineMode');
    if(!termTab.port) {
	termTab.baud = parseInt(baudSelect.value);
	termTab.dataBits = parseInt(dataBitsSelect.value);
	termTab.stopBits = parseInt(stopBitsSelect.value);
	termTab.parity = paritySelect.value;
	termTab.flowControl = flowControlSelect.value;
    }
    termTab.targetType = targetTypeSelect.value;
    termTab.newlineMode = newlineModeSelect.value;
}

function updateConnectParams(termTab) {
    const baudSelect = document.getElementById('baud');
    const dataBitsSelect = document.getElementById('dataBits');
    const stopBitsSelect = document.getElementById('stopBits');
    const paritySelect = document.getElementById('parity');
    const flowControlSelect = document.getElementById('flowControl');
    const targetTypeSelect = document.getElementById('targetType');
    const newlineModeSelect = document.getElementById('newlineMode');
    baudSelect.selectedIndex = 0;
    baudSelect.value = termTab.baud;
    dataBitsSelect.selectedIndex = 0;
    dataBitsSelect.value = termTab.dataBits;
    stopBitsSelect.selectedIndex = 0;
    stopBitsSelect.value = termTab.stopBits;
    paritySelect.selectedIndex = 0;
    paritySelect.value = termTab.parity;
    flowControlSelect.selectedIndex = 0;
    flowControlSelect.value = termTab.flowControl;
    targetTypeSelect.selectedIndex = 0;
    targetTypeSelect.value = termTab.targetType;
    newlineModeSelect.selectedIndex = 0;
    newlineModeSelect.value = termTab.newlineMode;
}

function updateButtonEnable(termTab) {
    const connectButton = document.getElementById('connect');
    const disconnectButton = document.getElementById('disconnect');
    const baudSelect = document.getElementById('baud');
    const dataBitsSelect = document.getElementById('dataBits');
    const stopBitsSelect = document.getElementById('stopBits');
    const paritySelect = document.getElementById('parity');
    const flowControlSelect = document.getElementById('flowControl');
    const sendButton = document.getElementById('send');
    const sendFileButton = document.getElementById('sendFile');
    const promptButton = document.getElementById('prompt');
    const interruptButton = document.getElementById('interrupt');
    if(termTab.port && !termTab.triggerClose && !termTab.triggerAbort) {
	connectButton.disabled = true;
	baudSelect.disabled = true;
	dataBitsSelect.disabled = true;
	stopBitsSelect.disabled = true;
	paritySelect.disabled = true;
	flowControlSelect.disabled = true
	disconnectButton.disabled = false;
	if(termTab.sending) {
	    sendButton.disabled = true;
	    sendFileButton.disabled = true;
	    promptButton.disabled = true;
	    interruptButton.disabled = false;
	} else {
	    sendButton.disabled = false;
	    sendFileButton.disabled = false;
	    promptButton.disabled = false;
	    interruptButton.disabled = true;
	}
    } else {
	sendButton.disabled = true;
	sendFileButton.disabled = true;
	promptButton.disabled = true;
	interruptButton.disabled = true;
	disconnectButton.disabled = true;
	connectButton.disabled = false;
	baudSelect.disabled = false;
	dataBitsSelect.disabled = false;
	stopBitsSelect.disabled = false;
	paritySelect.disabled = false;
	flowControlSelect.disabled = false;
    }
}

function currentTermId(type) {
    return 'termTab' + currentTermTab.tabId + type;
}

function currentEditId(type) {
    return currentEditTab + type;
}

function backTermTabUpdate(termTab) {
    const button =
	  document.getElementById('termTab' + termTab.tabId + 'Button');
    if(button) {
	button.classList.add('tab-edited');
    }
}

function foreTermTabUpdate(termTab) {
    const button =
	  document.getElementById('termTab' + termTab.tabId + 'Button');
    if(button) {
	button.classList.remove('tab-edited');
    }
}    

// function termTabSetTitle(title) {
//     const label = document.getElementById(currentTermId('Label'));
//     label.replaceChild(document.createTextNode(title), label.lastChild);
// }

async function termTabClick(event) {
    saveConnectParams(currentTermTab);
    
    const tabButtonClicked = event.target;
    const id = parseInt(event.target.dataset.id);

    for(const termTab of termTabs) {
	const tabButtonId = '#termTab' + termTab.tabId + 'Button'
	const tabButton = document.querySelector(tabButtonId);
	const tabId = '#termTab' + tabButton.dataset.id;
	const tab = document.querySelector(tabId);
	tabButton.classList.remove('tab-selected');
	tab.classList.add('tab-hidden');
    }
    
    document.querySelector('#termTab' + id).classList.remove('tab-hidden');
    document.querySelector('#termTab' + id + 'Button')
	.classList.add('tab-selected');
    for(const termTab of termTabs) {
	if(id == termTab.tabId) {
	    currentTermTab = termTab;
	}
    }

    updateConnectParams(currentTermTab);
    updateButtonEnable(currentTermTab);
    foreTermTabUpdate(currentTermTab);
    await delay(0);
    currentTermTab.fitAddon.fit();
};

function editTabSetTitle(title) {
    const label = document.getElementById(currentEditId('Label'));
    label.replaceChild(document.createTextNode(title), label.lastChild);
}

function editTabSetFileName(fileName) {
    if(!editTabFileName.get(currentEditTab)) {
	editTabFileName.set(currentEditTab, fileName);
	editTabSetTitle(fileName);
    }
}

function editTabResetFileName(fileName) {
    editTabFileName.set(currentEditTab, fileName);
    editTabSetTitle(fileName);
}

function editTabClearFileName() {
    editTabFileName.set(currentEditTab, null)
    editTabSetTitle(editTabOrigName.get(currentEditTab));
}

function editTabChanged() {
    const button = document.getElementById(currentEditId('Button'));
    button.classList.add('tab-edited');
}

function editTabSaved() {
    const button = document.getElementById(currentEditId('Button'));
    button.classList.remove('tab-edited');
}    

function editTabClick(event) {
    const tabButtonClicked = event.target;
    const id = event.target.dataset.id;

    const prevTabAreaInput = document.getElementById(currentEditId('Area'));
    currentSelection.set(currentEditId('Area'), {
	start: prevTabAreaInput.selectionStart,
	end: prevTabAreaInput.selectionEnd
    });
    
    for(const i of editTabs) {
	const tabButtonId = '#editTab' + i + 'Button'
	const tabButton = document.querySelector(tabButtonId);
	const tabId = '#' + tabButton.dataset.id;
	const tab = document.querySelector(tabId);
	tabButton.classList.remove('tab-selected');
	tab.classList.add('tab-hidden');
    }
    
    document.querySelector('#' + id).classList.remove('tab-hidden');
    document.querySelector('#' + id + 'Button')
	.classList.add('tab-selected');
    currentEditTab = id;
    
    const nextTabAreaInput = document.getElementById(currentEditId('Area'));
    nextTabAreaInput.focus();
    
    if(currentSelection.has(currentEditId('Area'))) {
	const selection = currentSelection.get(currentEditId('Area'));
	if(selection.start && selection.end) {
	    nextTabAreaInput.selectionStart = selection.start;
	    nextTabAreaInput.selectionEnd = selection.end;
	}
    }
};

function writeTerm(termTab, data) {
    termTab.term.write(data);
    termTab.currentData.push(data);
    if(termTab !== currentTermTab) {
	backTermTabUpdate(termTab);
    }
}

function getTargetType() {
    const targetTypeSelect = document.getElementById('targetType');
    return targetTypeSelect.value;
}

function getCursorPos(input) {
    if('selectionStart' in input) {
        return {
            start: input.selectionStart,
            end: input.selectionEnd
        };
    } else if(input.createTextRange) {
        let sel = document.selection.createRange();
        if(sel.parentElement() === input) {
            let range = input.createTextRange();
            range.moveToBookmark(sel.getBookmark());
	    let len = 0;
            for (;
                 range.compareEndPoints("EndToStart", range) > 0;
                 range.moveEnd("character", -1)) {
                len++;
            }
            range.setEndPoint("StartToStart", input.createTextRange());
	    let pos = { start: 0, end: len }
            for (;
                 range.compareEndPoints("EndToStart", range) > 0;
                 range.moveEnd("character", -1)) {
                pos.start++;
                pos.end++;
            }
            return pos;
        }
    }
    return -1;
}

function setCursorPos(input, start, end) {
    if(arguments.length < 3) {
	end = start;
    }
    if("selectionStart" in input) {
        setTimeout(() => {
            input.selectionStart = start;
            input.selectionEnd = end;
        }, 1);
    } else if(input.createTextRange) {
        let range = input.createTextRange();
        range.moveStart("character", start);
        range.collapse();
        range.moveEnd("character", end - start);
        range.select();
    }
}

async function selectWorkingDir() {
    try {
	workingDir = await window.showDirectoryPicker({ mode: 'read' });
    } catch(e) {
    }
}

async function getWorkingDir() {
    if(!workingDir) {
	await selectWorkingDir();
    }
    return workingDir;
}

async function getFile(parts, dirPath) {
    if(parts.length == 1) {
	for await(const entry of dirPath[dirPath.length - 1].values()) {
	    if(entry.name === parts[0]) {
		if(entry.kind === 'file') {
		    return await entry.getFile();
		} else if(entry.kind === 'directory') {
		    return null;
		}
	    }
	}
	return null;
    } else {
	if(parts[0] === '.') {
	    return await getFile(parts.slice(1), dirPath);
	} else if(parts[0] === '..') {
	    if(dirPath.length > 1) {
		return await getFile(parts.slice(1),
				     dirPath.slice(0, dirPath.length - 1));
	    } else {
		return null;
	    }
	} else {
	    for await(const entry of dirPath[dirPath.length - 1].values()) {
		if(entry.name === parts[0]) {
		    if(entry.kind === 'file') {
			return null;
		    } else if(entry.kind === 'directory') {
			return await getFile(parts.slice(1),
					     dirPath.concat([entry]));
		    }
		}
	    }
	    return null;
	}
    }
}

async function slurpFile(file) {
    const decoder = new TextDecoder();
    const arrayBuffer = await file.arrayBuffer();
    const string = decoder.decode(arrayBuffer);
    return string.split(/\r?\n/);
}

function errorMsg(termTab, msg) {
    writeTerm(termTab, '\x1B[31;1m' + msg + '\x1B[0m');
}

function infoMsg(termTab, msg) {
    writeTerm(termTab, '\x1B[33;1m' + msg + '\x1B[0m');
}

function removeComment(line) {
    for(let i = 0; i < line.length; i++) {
	if(line[i] === '\\') {
	    if((i === 0 || line[i - 1] === ' ' || line[i - 1] === '\t') &&
	       (i === line.length - 1 || line[i + 1] === ' ' ||
		line[i + 1] === '\t')) {
		return line.substring(0, i);
	    }
	}
    }
    return line;
}

function parseSymbols(lines, symbols) {
    for(const line of lines) {
	const mainPart = removeComment(line).trim();
	if(mainPart.length > 0) {
	    for(let i = 0; i < mainPart.length; i++) {
		if(mainPart[i] === ' ' || mainPart[i] === '\t') {
		    const key = mainPart.substring(0, i);
		    const value =
			  mainPart.substring(i, mainPart.length).trim();
		    symbols.set(key, value);
		}
	    }
	}
    }
}

function lookupSymbol(symbol, symbolStack) {
    for(let i = symbolStack.length - 1; i >= 0; i--) {
	if(symbolStack[i].has(symbol)) {
	    return symbolStack[i].get(symbol);
	}
    }
    return symbol;
}

function isSymbolStackEmpty(symbolStack) {
    for(const symbols of symbolStack) {
	if(symbols.size > 0) {
	    return false;
	}
    }
    return true;
}

function applySymbols(line, symbolStack) {
    if(isSymbolStackEmpty(symbolStack)) {
	return line;
    }
    let newLine = ''
    let i = 0;
    while(i < line.length) {
	if(line[i] === ' ' || line[i] === '\t') {
	    newLine = newLine + line[i];
	    i++;
	} else {
	    let start = i;
	    while(i < line.length) {
		if(line[i] !== ' ' && line[i] !== '\t') {
		    i++;
		} else {
		    break;
		}
	    }
	    let symbol = line.substring(start, i);
	    newLine = newLine + lookupSymbol(symbol, symbolStack);
	}
    }
    return newLine;
}

async function expandLines(lines, symbolStack) {
    let allLines = [];
    for (const line of lines) {
	const parts = line.trim().split(/\s+/, 2);
	if(parts.length > 1 && parts[0] === '#include') {
	    const workingDir = await getWorkingDir();
	    if(!workingDir) {
		errorMsg('Canceled\r\n');
		return null;
	    }
	    const file = await getFile(parts[1].trim().split(/\//),
				       [workingDir]);
	    if(!file) {
		errorMsg(parts[1].trim() + ': file not found\r\n');
		return null;
	    }
	    const fileLines = await slurpFile(file);
	    const expandedLines =
		  await expandLines(fileLines, symbolStack.concat([new Map()]));
	    if (!expandedLines) {
		return null;
	    }
	    allLines = allLines.concat(expandedLines);
	} else if(parts.length > 1 && parts[0] === '#symbols') {
	    const workingDir = await getWorkingDir();
	    if(!workingDir) {
		errorMsg('Canceled\r\n');
		return null;
	    }
	    const file = await getFile(parts[1].trim().split(/\//),
				       [workingDir])
	    if(!file) {
		errorMsg(parts[1].trim() + ': file not found\r\n');
		return null;
	    }
	    const fileLines = await slurpFile(file);
	    const expandedLines = await expandLines(fileLines, [new Map()]);
	    if (!expandedLines) {
		return null;
	    }
	    parseSymbols(expandedLines, symbolStack[symbolStack.length - 1]);
	} else {
	    allLines.push(applySymbols(line, symbolStack));
	}
    }
    return allLines;
}

async function writeLine(termTab, line) {
    const encoder = new TextEncoder();
    line = line + '\r';
    while(termTab.portWriter && line.length > 128) {
	await termTab.portWriter.write(encoder.encode(line.substring(0, 128)));
	await delay(20);
	line = line.substring(128);
    }
    if(termTab.portWriter && line.length) {
	await termTab.portWriter.write(encoder.encode(line));
    }
}

function stripLine(line) {
    line = line.trim();
    if(line[0] == '\\') {
	return '';
    }
    return line;
}

function stripCode(lines) {
    const allLines = [];
    const noBlankLines = [];
    for(const line of lines) {
	allLines.push(stripLine(line));
    }
    for(const line of allLines) {
	if(line) {
	    noBlankLines.push(line);
	}
    }
    return noBlankLines;
}

async function disconnect(termTab, lost = false) {
    const sendButton = document.getElementById('send');
    const sendFileButton = document.getElementById('sendFile');
    const promptButton = document.getElementById('prompt');
    const interruptButton = document.getElementById('interrupt');
    const disconnectButton = document.getElementById('disconnect');
    if(termTab === currentTermTab) {
	sendButton.disabled = true;
	sendFileButton.disabled = true;
	promptButton.disabled = true;
	interruptButton.disabled = true;
	disconnectButton.disabled = true;
    }
    if(!lost) {
	termTab.interruptCount++;
    }
    const isSending = termTab.sending;
    const isReceiving = termTab.receiving;
    termTab.triggerClose = true;
    termTab.triggerAbort = true;
    if(termTab.portReader) {
	await termTab.portReader.cancel();
	if(termTab.portReader) {
	    termTab.portReader.releaseLock();
	    termTab.portReader = null;
	}
    }
    if(termTab.port.readable) {
	termTab.port.readable.cancel();
    }
    if(termTab.portWriter) {
	await termTab.portWriter.abort();
	if(termTab.portWriter) {
	    termTab.portWriter.releaseLock();
	    termTab.portWriter = null;
	}
    }
    if(termTab.port.writable) {
	termTab.port.writable.abort();
    }
    while(isSending && termTab.triggerAbort) {
	await delay(10);
    }
    while(isReceiving && termTab.triggerClose) {
	await delay(10);
    }
    termTab.port.close();
    termTab.port = null;
    termTab.triggerAbort = false;
    termTab.triggerClose = false;
    const connectButton = document.getElementById('connect');
    const baudSelect = document.getElementById('baud');
    const dataBitsSelect = document.getElementById('dataBits');
    const stopBitsSelect = document.getElementById('stopBits');
    const paritySelect = document.getElementById('parity');
    const flowControlSelect = document.getElementById('flowControl');
    if(termTab === currentTermTab) {
	connectButton.disabled = false;
	baudSelect.disabled = false;
	dataBitsSelect.disabled = false;
	stopBitsSelect.disabled = false;
	paritySelect.disabled = false;
	flowControlSelect.disabled = false;
    }
    if(!lost) {
	infoMsg(termTab, 'Disconnected\r\n');
    } else {
	errorMsg(termTab, 'Connection lost\r\n');
    }
}

async function writeText(termTab, text) {
    termTab.sending = true;
    const sendButton = document.getElementById('send');
    const sendFileButton = document.getElementById('sendFile');
    const promptButton = document.getElementById('prompt');
    const interruptButton = document.getElementById('interrupt');
    const timeoutCheckbox = document.getElementById('timeout');
    const timeoutEnabled = timeoutCheckbox.checked;
    const timeoutMsInput = document.getElementById('timeoutMs');
    const timeoutMs = timeoutMsInput.value;
    if(termTab === currentTermTab) {
	sendButton.disabled = true;
	sendFileButton.disabled = true;
	promptButton.disabled = true;
    }
    let lines = await expandLines(text.split(/\r?\n/),
				  [globalSymbols, new Map()]);
    if(!lines) {
	if(termTab === currentTermTab) {
	    sendButton.disabled = false;
	    sendFileButton.disabled = false;
	    promptButton.disabled = false;
	}
	termTab.sending = false;
	termtab.triggerAbort = false;
	return;
    }
    stripCheckbox = document.getElementById('strip');
    if(stripCheckbox.checked) {
	lines = stripCode(lines);
	if(lines.length == 0) {
	    lines = [''];
	}
    }
    let currentAckCount = termTab.ackCount;
    let currentNakCount = termTab.nakCount;
    let currentInterruptCount = termTab.interruptCount;
    let currentLostCount = termTab.lostCount;
    if(termTab === currentTermTab) {
	interruptButton.disabled = false;
    }
    try {
	for(const line of lines) {
	    if(termTab.triggerAbort) {
		if(termTab.portWriter) {
		    termTab.portWriter.releaseLock();
		    termTab.portWriter = null;
		}
		break;
	    }
	    if(termTab.port.writable) {
		termTab.portWriter = termTab.port.writable.getWriter();
	    } else {
		termTab.triggerAbort = false;
		termTab.sending = false;
		await disconnect(termTab, true);
		return;
	    }
	    try {
		await writeLine(termTab, line);
		if(lines.length > 1) {
		    let timedOut = false;
		    let myTimeout;
		    if(timeoutEnabled) {
			myTimeout = setTimeout(() => {
			    timedOut = true;
			}, timeoutMs);
		    }
		    while(termTab.ackCount === currentAckCount &&
			  termTab.nakCount === currentNakCount &&
			  termTab.interruptCount === currentInterruptCount &&
			  termTab.lostCount === currentLostCount &&
			  !timedOut) {
			await delay(0);
		    }
		    currentAckCount = termTab.ackCount;
		    if(termTab.lostCount !== currentLostCount) {
			termTab.triggerAbort = false;
			termTab.sending = false;
			await disconnect(termTab, true);
			break;
		    }
		    if(termTab.interruptCount !== currentInterruptCount) {
			errorMsg(termTab, 'Interrupted\r\n');
			break;
		    }
		    if(timedOut) {
			errorMsg(termTab, 'Timed out\r\n');
			break;
		    }
		    if(termTab.nakCount !== currentNakCount) {
			break;
		    }
		    if(timeoutEnabled) {
			clearTimeout(myTimeout);
		    }
		}
	    } finally {
		if(termTab.portWriter) {
		    termTab.portWriter.releaseLock();
		    termTab.portWriter = null;
		}
	    }
	}
    } catch(e) {
    } finally {
	if(termTab.port) {
	    termTab.triggerAbort = false;
	    if(termTab === currentTermTab) {
		sendButton.disabled = false;
		sendFileButton.disabled = false;
		promptButton.disabled = false;
		interruptButton.disabled = true;
	    }
	    termTab.sending = false;
	}
    }
}

async function clearArea() {
    const area = document.getElementById(currentEditId('Area'));
    area.value = '';
    area.selectionStart = null;
    area.selectionEnd = null;
    editTabSaved();
    editTabClearFileName();
}

async function appendFile() {
    const fileHandles = await window.showOpenFilePicker({});
    if(fileHandles.length !== 1) {
	return;
    }
    const file = await fileHandles[0].getFile();
    const fileLines = await slurpFile(file);
    const area = document.getElementById(currentEditId('Area'));
    const areaLines = area.value.split(/\r?\n/);
    let areaLinesTruncated = areaLines;
    if(areaLines[areaLines.length - 1] === '') {
	areaLinesTruncated = areaLines.slice(0, areaLines.length - 1);
    }
    const start = area.selectionStart;
    const end = area.selectionEnd;
    area.value = areaLinesTruncated.concat(fileLines).join('\n');
    if(areaLinesTruncated.length > 0 && fileLines.length > 0) {
	editTabChanged();
    } else if(fileLines.length > 0) {
	editTabSetFileName(file.name);
    }
    area.selectionStart = start;
    area.selectionEnd = end;
}

async function sendFile() {
    const fileHandles = await window.showOpenFilePicker({});
    if(fileHandles.length !== 1) {
	return;
    }
    const file = await fileHandles[0].getFile();
    const decoder = new TextDecoder();
    const arrayBuffer = await file.arrayBuffer();
    const string = decoder.decode(arrayBuffer);
    await writeText(currentTermTab, string);
}

async function setGlobalSymbols() {
    const fileHandles = await window.showOpenFilePicker({});
    if(fileHandles.length !== 1) {
	return;
    }
    const file = await fileHandles[0].getFile();
    const fileLines = await slurpFile(file);
    globalSymbols = new Map();
    parseSymbols(fileLines, globalSymbols);
    infoMsg(currentTermTab, 'New global symbols loaded\r\n');
}

async function saveTerminal(termTab) {
    try {
	const fileHandle = await window.showSaveFilePicker({});
	const writable = await fileHandle.createWritable();
	for(const item of termTab.currentData) {
	    await writable.write(item);
	}
	await writable.close();
    } catch(e) {
    }
}

async function saveEdit() {
    try {
	const fileHandle = await window.showSaveFilePicker({});
	const area = document.getElementById(currentEditId('Area'));
	editTabResetFileName(fileHandle.name);
	const writable = await fileHandle.createWritable();
	const saveFormatSelect = document.getElementById('saveFormat');
	const newline = saveFormatSelect.value === 'crlf' ? '\r\n' : '\n';
	await writable.write(area.value.split(/\r?\n/).join(newline));
	await writable.close();
	editTabSaved();
    } catch(e) {
    }
}

async function expandIncludes() {
    const area = document.getElementById(currentEditId('Area'));
    const lines = await expandLines(area.value.split(/\r?\n/), [new Map()]);
    if(!lines) {
	return;
    }
    area.value = lines.join('\n');
    editTabChanged();
}

function addToHistory(line) {
    const historyDropdown = document.getElementById('history');
    let found = false;
    for(let i = 0; i < history.length; i++) {
	if(line === history[i]) {
	    historyDropdown.options.remove(i);
	    history = [line].concat(history.slice(0, i))
		.concat(history.slice(i + 1));
	    found = true;
	    break;
	}
    }
    if(!found) {
	history.unshift(line);
    }
    currentHistoryIdx = -1;
    if(historyDropdown.options.length > 0) {
	historyDropdown.options.add(new Option(line, line), 0);
    } else {
	historyDropdown.options.add(new Option(line, line), null);
    }
    historyDropdown.selectedIndex = -1;
}

async function sendEntry() {
    const promptButton = document.getElementById('prompt');
    const lineInput = document.getElementById('line');
    if(!promptButton.disabled) {
	addToHistory(lineInput.value);
	await writeText(currentTermTab, lineInput.value);
	lineInput.value = '';
    }
}

function interrupt(termTab) {
    termTab.interruptCount++;
}

async function connect(termTab) {
    saveConnectParams(termTab);
    termTab.lostCount = 0;
    termTab.port = await navigator.serial.requestPort({ filters: [] });
    await termTab.port.open({ bufferSize: 65535,
			      baudRate: termTab.baud,
			      dataBits: termTab.dataBits,
			      stopBits: termTab.stopBits,
			      parity: termTab.parity,
			      flowControlSelect: termTab.flowControl });
    const baudSelect = document.getElementById('baud');
    const dataBitsSelect = document.getElementById('dataBits');
    const stopBitsSelect = document.getElementById('stopBits');
    const paritySelect = document.getElementById('parity');
    const flowControlSelect = document.getElementById('flowControl');
    const connectButton = document.getElementById('connect');
    const sendButton = document.getElementById('send');
    const sendFileButton = document.getElementById('sendFile');
    const promptButton = document.getElementById('prompt');
    const disconnectButton = document.getElementById('disconnect');
    if(termTab === currentTermTab) {
	connectButton.disabled = true;
	baudSelect.disabled = true;
	dataBitsSelect.disabled = true;
	stopBitsSelect.disabled = true;
	paritySelect.disabled = true;
	flowControlSelect.disabled = true
	sendButton.disabled = false;
	sendFileButton.disabled = false;
	promptButton.disabled = false;
	disconnectButton.disabled = false;
    };
    infoMsg(termTab, 'Connected\r\n');
    try {
	while (!termTab.triggerClose && termTab.port.readable) {
	    termTab.receiving = true;
	    termTab.portReader = termTab.port.readable.getReader();
	    try {
		while (termTab.portReader) {
		    const { value, done } = await termTab.portReader.read();
		    if (done) {
			break;
		    }
		    let fixedValue = [];
		    if(termTab.targetType === 'zeptoforth') {
			for(let i = 0; i < value.length; i++) {
			    if(value[i] === 0x06) {
				termTab.ackCount++;
			    }
			    if(value[i] === 0x15) {
				termTab.nakCount++;
			    }
			}
		    }
		    if(termTab.newlineMode === 'lf') {
			for(let i = 0; i < value.length; i++) {
			    if(value[i] === 0x0A) {
				fixedValue.push(0x0D);
				fixedValue.push(0x0A);
			    } else {
				fixedValue.push(value[i]);
			    }
			}
			fixedValue = Uint8Array.from(fixedValue);
		    } else {
			fixedValue = value;
		    }
		    if(termTab.targetType === 'mecrisp' ||
		       termTab.targetType === 'stm8eforth' ||
		       termTab.targetType === 'esp32forth') {
			for(let i = 0; i < fixedValue.length; i++) {
			    if((fixedValue[i] === 0x20 &&
				termTab.okCount === 0) ||
			       (fixedValue[i] === 0x6F &&
				termTab.okCount === 1) ||
			       (fixedValue[i] === 0x6B &&
				termTab.okCount === 2) ||
			       (fixedValue[i] === 0x2E &&
				termTab.okCount === 3 &&
				termTab.targetType === 'mecrisp') ||
			       (fixedValue[i] === 0x0D &&
				termTab.okCount === 3 &&
				termTab.targetType === 'esp32forth') ||
			       (fixedValue[i] === 0x0A &&
				termTab.okCount === 4 &&
				termTab.targetType === 'esp32forth') ||
			       (fixedValue[i] === 0x2D &&
				termTab.okCount === 5 &&
				termTab.targetType === 'esp32forth') ||
			       (fixedValue[i] === 0x2D &&
				termTab.okCount === 6 &&
				termTab.targetType === 'esp32forth') ||
			       (fixedValue[i] === 0x3E &&
				termTab.okCount === 7 &&
				termTab.targetType === 'esp32forth')) {
				termTab.okCount++;
			    } else if(fixedValue[i] === 0x20 &&
				      termTab.okCount === 8 &&
				      termTab.targetType === 'esp32forth') {
				termTab.ackCount++;
				termTab.okCount = 0;
			    } else if(fixedValue[i] === 0x20 &&
				      termTab.okCount === 1) {
			    } else if((fixedValue[i] === 0x0D ||
				       fixedValue[i] === 0x0A) &&
				      ((termTab.okCount === 4 &&
					termTab.targetType === 'mecrisp') ||
				       (termTab.okCount === 3 &&
					termTab.targetType === 'stm8eforth'))) {
				termTab.ackCount++;
				termTab.okCount = 0;
			    } else {
				termTab.okCount = 0;
			    }
			}
		    }
		    writeTerm(termTab, fixedValue);
		    termTab.term.scrollToBottom();
		}
	    } finally {
		if(termTab.portReader) {
		    termTab.portReader.releaseLock();
		    termTab.portReader = null;
		}
		termTab.receiving = false;
	    }
	}
	if(!termTab.port.readable) {
	    if(termTab.sending) {
		termTab.lostCount++;
	    } else {
		disconnect(termTab, true);
	    }
	}
    } catch(e) {
	if(termTab.sending) {
	    termTab.lostCount++;
	} else {
	    disconnect(termTab, true);
	}
    } finally {
	termTab.triggerClose = false;
    }
}

function debounce(func) {
    let timer;
    return event => {
	if(timer) {
	    clearTimeout(timer);
	}
	timer = setTimeout(func,100,event);
    };
}

function help() {
    const helpLines =
	  ["\r\n",
	   "Help\r\n",
	   "\r\n",
	   "Enter at the REPL line or '>>>' uploads the contents of the REPL line to the target. 'Send' uploads the contents of the edit area to the target, or if only a portion has been selected, just that portion. 'Send File' selects a file to send and then sends it, without loading it into the edit area. 'Interrupt' or Control-Q interrupts the current upload to the target. 'Clear' clears the contents of the edit area.\r\n\r\n",
	   "Up and Down Arrow navigate the history of the REPL line, with the Up Arrow navigating to the next oldest entry in the history, and Down Arrow navigating to the next newest entry in the history.\r\n\r\n",
	   "'Connect' queries the user for a serial device to select, and if successful connects zeptocom.js to that serial device. 'Baud' specifies the baud rate, 'Data Bits' specifies the number of data bits, 'Stop Bits' specifies the number of stop bits, 'Parity' specifies the parity, and 'Flow Control' specifies the flow control to use; these must all be set prior to clicking 'Connect', and the defaults are good ones - in most cases one will not need any setting other than 115200 baud, 8 data bits, 1 stop bits, no parity, and no flow control.\r\n\r\n",
	   "'Disconnect' ends the connection with the current serial device, and interrupts any data transfer that may be currently on-going.\r\n\r\n",
	   "'Target Type' specifies the particular target type to support; the current options are 'zeptoforth', 'Mecrisp', 'STM8 eForth', and 'ESP32Forth'; note that proper selection of this option is necessary for proper functioning of zeptocom.js with a given target. 'Newline Mode' sets the newline mode to either CRLF (the default for zeptoforth or ESP32Forth) or LR (the default for Mecrisp or STM8 eForth); setting the 'Target Type' automatically sets the 'Newline Mode'.\r\n\r\n",
	   "'Save Terminal' exactly saves the contents of the terminal to selected file. No attempt is made to convert newlines to the local newline settings.\r\n\r\n",
	   "'Save Edit' saves the contents of the edit area to a selected file. The newlines are converted to the newline format selected in 'Save Edit Format'.\r\n\r\n",
	   "'Append File' selects a file to append to the edit area.\r\n\r\n",
	   "'Expand Includes' expands all the '#include' and '#symbols' lines in the edit area and any files included by files so included.\r\n\r\n",
	   "'Set Working Directory' selects a working directory for use by '#include' and '#symbols'. Note that if '#include' or '#symbols' are invoked at any time without a working directory being set, the user will be queried to select a working directory.\r\n\r\n",
	   "Lines containing '#include' followed by a path relative to the working directory will be included in uploads; these lines can be present at the REPLline , in code uploaded from the edit area, and from within included files.\r\n\r\n",
	   "Lines containing '#symbols' followed by a path relative to the working directory will specify symbol files to be applied to uploads; these lines can be preset in the edit area and from within included files.\r\n\r\n",
	   "Global symbols are applied to all uploaded to the target, whether from the REPL line, the edit area, or included files; note that subsequent '#symbols' lines temporarily override global symbols within the context in which they are specified.\r\n\r\n",
	   "Symbol files consist of symbol replacement pairs separated by whitespace. They may also contain '\\' comments and '#include' lines.\r\n\r\n",
	   "'Strip Code', when selected, automatically removes whitespace and line comments, when possible, from uploaded code.\r\n\r\n",
	   "'Timeout', when selected, specifies a per-line timeout in milliseconds where if while uploading multiple lines of code the timeout for that line expires, upload will be automatically interrupted.\r\n",
	   "\r\n"];
    for(const line of helpLines) {
	infoMsg(currentTermTab, line);
    }
}

function license() {
    const licenseLines =
	  ["\r\n",
	   "License\r\n",
	   "\r\n",
	   "Copyright (c) 2022 Travis Bemann\r\n",
	   "\r\n",
	   "Permission is hereby granted, free of charge, to any person obtaining a copy\r\n",
	   "of this software and associated documentation files (the \"Software\"), to deal\r\n",
	   "in the Software without restriction, including without limitation the rights\r\n",
	   "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n",
	   "copies of the Software, and to permit persons to whom the Software is\r\n",
	   "furnished to do so, subject to the following conditions:\r\n",
	   "\r\n",
	   "The above copyright notice and this permission notice shall be included in all\r\n",
	   "copies or substantial portions of the Software.\r\n",
	   "\r\n",
	   "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n",
	   "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n",
	   "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n",
	   "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n",
	   "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n",
	   "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\r\n",
	   "SOFTWARE.\r\n",
	   "\r\n"
	  ];
    for(const line of licenseLines) {
	infoMsg(currentTermTab, line);
    }
}

function populateArea() {
    const area = document.getElementById(currentEditId('Area'));
    area.value =
	["\\ Put your Forth code to upload here.",
	 "\\ ",
	 "\\ Clicking 'Send' without a selection will upload the contents of this area to the target.",
	 "\\ ",
	 "\\ Clicking 'Send' with a selection will upload just the selection to the target.",
	 "",
	 ""].join('\r\n');
}

function inputAreaEnter() {
    const area = document.getElementById(currentEditId('Area'));
    const { start, end } = getCursorPos(area);
    const startString = area.value.substring(0, start);
    let indentIndex = start;
    let startIndex = start;
    for(let i = start - 1; i >= 0; i--) {
	if(startString[i] === '\n') {
	    startIndex = i + 1;
	    break;
	}
	if(startString[i] !== ' ' && startString[i] !== '\t') {
	    indentIndex = i;
	}
	if(i === 0) {
	    startIndex = 0;
	}
    }
    const indentString = startString.substring(startIndex, indentIndex);
    area.focus();
    document.execCommand('insertText', false, '\n' + indentString);
    editTabChanged();
}

function insertIndent(area, start) {
    const startString = area.value.substring(0, start);
    let indentIndex = start;
    let startIndex = start;
    for(let i = start - 1; i >= 0; i--) {
	if(startString[i] === '\n') {
	    startIndex = i + 1;
	    break;
	}
	if(i === 0) {
	    startIndex = 0;
	}
    }
    let indentCount = 2 - ((indentIndex - startIndex) % 2);
    const indentString = indentCount == 1 ? ' ' : '  ';
    area.focus();
    document.execCommand('insertText', false, indentString);
    editTabChanged();
}

function indentRegion(area, start, end) {
    const startString = area.value.substring(0, start);
    let indentIndex = start;
    let startIndex = start;
    for(let i = start - 1; i >= 0; i--) {
	if(startString[i] === '\n') {
	    startIndex = i + 1;
	    break;
	}
	if(i === 0) {
	    startIndex = 0;
	}
    }
    area.focus();
    area.setSelectionRange(startIndex, end);
    const part = area.value.substring(startIndex, end);
    const lines = part.split(/\r?\n/).map(line => '  ' + line);
    document.execCommand('insertText', false, lines.join('\n'));
    area.setSelectionRange(start + 2,
			   end + (lines.length * 2));
    editTabChanged();
}

function inputAreaTab() {
    const area = document.getElementById(currentEditId('Area'));
    const { start, end } = getCursorPos(area);
    if(start == end) {
	insertIndent(area, start);
    } else {
	indentRegion(area, start, end);
    }
}

async function sendArea() {
    const area = document.getElementById(currentEditId('Area'));
    const { start, end } = getCursorPos(area);
    if(start !== end) {
	await writeText(currentTermTab, area.value.substring(start, end));
    } else {
	await writeText(currentTermTab, area.value);
    }
}

async function newTermTab(title) {
    if(currentTermTab) {
	saveConnectParams(currentTermTab);
    }
    const tabButtonId = 'termTab' + termTabCount + 'Button';
    const tabButton = document.createElement('div');
    tabButton.id = tabButtonId;
    tabButton.dataset.id = termTabCount;
    const tabLabel = document.createElement('label');
    const tabTitle = document.createTextNode(title);
    tabLabel.id = 'termTab' + termTabCount + 'Label';
    tabLabel.dataset.id = termTabCount;
    tabLabel.appendChild(tabTitle);
    tabButton.appendChild(tabLabel);
    tabButton.appendChild(document.createTextNode('  '));
    const tabRemoveLabel = document.createElement('label');
    const tabRemoveTitle = document.createTextNode('x');
    tabRemoveLabel.appendChild(tabRemoveTitle);
    tabButton.appendChild(tabRemoveLabel);
    const currentTermTabCount = termTabCount;
    const termTabHeaderDiv = document.getElementById('termTabHeader');
    tabButton.classList.add('tab');
    const addTermTabDiv = document.getElementById('addTermTab');
    termTabHeaderDiv.insertBefore(tabButton, addTermTabDiv);
    const termTabPanel = document.createElement('div');
    termTabPanel.id = 'termTab' + termTabCount;
    termTabPanel.classList.add('tab-panel');
    const terminalPane = document.createElement('div');
    terminalPane.id = 'termTab' + termTabCount + 'Term';
    terminalPane.name = 'termTab' + termTabCount + 'Term';
    terminalPane.style.width = '100%';
    terminalPane.style.flexGrow = 1;
    termTabPanel.appendChild(terminalPane);
    const termTabBodyDiv = document.getElementById('termTabBody');
    termTabBodyDiv.appendChild(termTabPanel);
    currentTermTab = 'termTab' + termTabCount;
    termTabCount++;
    tabButton.addEventListener('click', termTabClick);
    for(const termTab of termTabs) {
	const tabButtonId = '#termTab' + termTab.tabId + 'Button';
	const tabButton = document.querySelector(tabButtonId);
	const tabId = '#termTab' + termTab.tabId;
	const tab = document.querySelector(tabId);
	tabButton.classList.remove('tab-selected');
	tab.classList.add('tab-hidden');
    }
    document.querySelector('#termTab' + currentTermTabCount)
	.classList.remove('tab-hidden');
    tabButton.classList.add('tab-selected');
    const term = new Terminal();
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    const newTermTab = {
	tabId: currentTermTabCount,
	ackCount: 0,
	nakCount: 0,
	interruptCount: 0,
	lostCount: 0,
	workingDir: null,
	term: term,
	fitAddon: fitAddon,
	port: null,
	okCount: 0,
	currentData: [],
	triggerClose: false,
	triggerAbort: false,
	portReader: null,
	portWriter: null,
	sending: null,
	receiving: null
    };
    termTabs.push(newTermTab);
    currentTermTab = newTermTab;
    term.open(terminalPane);
    term.setOption('bellStyle', 'both');
    term.setOption('cursorStyle', 'block');
    await delay(0);
    fitAddon.fit();
    resizeObserver = new ResizeObserver(debounce(e => {
	if(newTermTab === currentTermTab) {
	    fitAddon.fit();
	}
    }));
    resizeObserver.observe(terminalPane, {});
    updateButtonEnable(newTermTab);
    tabRemoveLabel.addEventListener('click', event => {
	if(termTabs.length > 1) {
	    let nextTab = termTabs[0];
	    if(nextTab === newTermTab) {
		nextTab = termTabs[1];
	    }
	    for(const tab of termTabs) {
		if(tab === newTermTab) {
		    break;
		}
		nextTab = tab;
	    }
	    termTabs = termTabs.filter(tab => tab !== newTermTab);
	    tabButton.remove();
	    termTabPanel.remove();
	    for(const tab1 of termTabs) {
		const tabButtonId = '#termTab' + tab1.tabId + 'Button';
		const tabButton = document.querySelector(tabButtonId);
		const tabId = '#termTab' + tab1.tabId;
		const tab = document.querySelector(tabId);
		tabButton.classList.remove('tab-selected');
		tab.classList.add('tab-hidden');
	    }
	    document.querySelector('#termTab' + nextTab.tabId)
		.classList.remove('tab-hidden');
	    document.querySelector('#termTab' + nextTab.tabId + 'Button')
		.classList.add('tab-selected');
	    currentTermTab = nextTab;
	    foreTermTabUpdate(currentTermTab);
	    setTimeout(async () => {
		await disconnect(newTermTab);
		term.dispose();
		resizeObserver.disconnect();
	    }, 0);
	}
	event.stopPropagation();
	event.preventDefault();
    });
}

async function newEditTab(title) {
    const tabButtonId = 'editTab' + editTabCount + 'Button';
    const tabButton = document.createElement('div');
    tabButton.id = tabButtonId;
    tabButton.dataset.id = 'editTab' + editTabCount;
    const tabLabel = document.createElement('label');
    const tabTitle = document.createTextNode(title);
    tabLabel.id = 'editTab' + editTabCount + 'Label';
    tabLabel.dataset.id = 'editTab' + editTabCount;
    editTabFileName.set('editTab' + editTabCount, null);
    editTabOrigName.set('editTab' + editTabCount, title);
    tabLabel.appendChild(tabTitle);
    tabButton.appendChild(tabLabel);
    tabButton.appendChild(document.createTextNode('  '));
    const tabRemoveLabel = document.createElement('label');
    const tabRemoveTitle = document.createTextNode('x');
    tabRemoveLabel.appendChild(tabRemoveTitle);
    tabButton.appendChild(tabRemoveLabel);
    const currentEditTabCount = editTabCount;
    const editTabHeaderDiv = document.getElementById('editTabHeader');
    tabButton.classList.add('tab');
    const addEditTabDiv = document.getElementById('addEditTab');
    editTabHeaderDiv.insertBefore(tabButton, addEditTabDiv);
    const editTabPanel = document.createElement('div');
    editTabPanel.id = 'editTab' + editTabCount;
    editTabPanel.classList.add('tab-panel');
    const tabArea = document.createElement('textarea');
    tabArea.id = 'editTab' + editTabCount + 'Area';
    tabArea.name = 'editTab' + editTabCount + 'Area';
    tabArea.spellcheck = false;
    tabArea.style.width = '100%';
    tabArea.style.fontFamily = 'monospace';
    tabArea.style.backgroundColor = '#444444';
    tabArea.style.color = '#FFFFFF';
    tabArea.style.flexGrow = 1;
    tabArea.addEventListener('keypress', event => {
	if(event.key === 'Enter') {
	    inputAreaEnter();
	    event.preventDefault();
	    event.stopPropagation();
	}
    });
    tabArea.addEventListener('keydown', event => {
	if(event.key === 'Tab') {
	    inputAreaTab();
	    event.preventDefault();
	    event.stopPropagation();
	}
    });
    tabArea.addEventListener('blur', event => {
	currentSelection.set(tabArea.id, {
	    start: tabArea.selectionStart,
	    end: tabArea.selectionEnd
	});
    });
    tabArea.addEventListener('focus', event => {
	if(currentSelection.has(tabArea.id)) {
	    const selection = currentSelection.get(tabArea.id);
	    tabArea.selectionStart = selection.start;
	    tabArea.selectionEnd = selection.end;
	}
    });
    tabArea.addEventListener('input', event => {
	editTabChanged();
    });
    editTabPanel.appendChild(tabArea);
    const editTabBodyDiv = document.getElementById('editTabBody');
    editTabBodyDiv.appendChild(editTabPanel);
    currentEditTab = 'editTab' + editTabCount;
    editTabs.push(editTabCount);
    editTabCount++;
    tabButton.addEventListener('click', editTabClick);
    for(const i of editTabs) {
	const tabButtonId = '#editTab' + i + 'Button';
	const tabButton = document.querySelector(tabButtonId);
	const tabId = '#editTab' + i;
	const tab = document.querySelector(tabId);
	const tabArea = document.querySelector(tabId + 'Area');
	tabButton.classList.remove('tab-selected');
	tab.classList.add('tab-hidden');
    }
    document.querySelector('#editTab' + currentEditTabCount)
	.classList.remove('tab-hidden');
    tabButton.classList.add('tab-selected');
    tabRemoveLabel.addEventListener('click', event => {
	if(editTabs.length > 1) {
	    let nextTab = editTabs[0];
	    if(nextTab === currentEditTabCount) {
		nextTab = editTabs[1];
	    }
	    for(const tab of editTabs) {
		if(tab === currentEditTabCount) {
		    break;
		}
		nextTab = tab;
	    }
	    editTabs = editTabs.filter(tab => tab !== currentEditTabCount);
	    tabButton.remove();
	    editTabPanel.remove();
	    for(const i of editTabs) {
		const tabButtonId = '#editTab' + i + 'Button';
		const tabButton = document.querySelector(tabButtonId);
		const tabId = '#editTab' + i;
		const tab = document.querySelector(tabId);
		const tabArea = document.querySelector(tabId + 'Area');
		tabButton.classList.remove('tab-selected');
		tab.classList.add('tab-hidden');
	    }
	    document.querySelector('#editTab' + nextTab)
		.classList.remove('tab-hidden');
	    document.querySelector('#editTab' + nextTab + 'Button')
		.classList.add('tab-selected');
	    currentEditTab = 'editTab' + nextTab;	    
	}
	event.stopPropagation();
	event.preventDefault();
    });
}

async function startTerminal() {
    const baudSelect = document.getElementById('baud');
    for(let i = 0; i < baudSelect.options.length; i++) {
	if(baudSelect.options[i].value == '115200') {
	    baudSelect.selectedIndex = i;
	    break;
	}
    }
    const targetTypeSelect = document.getElementById('targetType');
    targetTypeSelect.selectedIndex = 0;
    targetTypeSelect.addEventListener('change', event => {
	saveConnectParams(currentTermTab);
    });
    const newlineModeSelect = document.getElementById('newlineMode');
    newlineModeSelect.selectedIndex = 0;
    newlineModeSelect.addEventListener('change', event => {
	saveConnectParams(currentTermTab);
    });
    const dataBitsSelect = document.getElementById('dataBits');
    dataBitsSelect.selectedIndex = 0;
    dataBitsSelect.addEventListener('change', event => {
	saveConnectParams(currentTermTab);
    });
    const stopBitsSelect = document.getElementById('stopBits');
    stopBitsSelect.selectedIndex = 0;
    stopBitsSelect.addEventListener('change', event => {
	saveConnectParams(currentTermTab);
    });
    const paritySelect = document.getElementById('parity');
    paritySelect.selectedIndex = 0;
    paritySelect.addEventListener('change', event => {
	saveConnectParams(currentTermTab);
    });
    const flowControlSelect = document .getElementById('flowControl');
    flowControlSelect.selectedIndex = 0;
    flowControlSelect.addEventListener('change', event => {
	saveConnectParams(currentTermTab);
    });
    const saveFormatSelect = document.getElementById('saveFormat');
    saveFormatSelect.selectedIndex = 1;
    targetTypeSelect.addEventListener('change', () => {
	if(targetTypeSelect.value === 'mecrisp' ||
	   targetTypeSelect.value === 'stm8eforth') {
	    newlineMode.selectedIndex = 1;
	} else if(targetTypeSelect.value === 'zeptoforth' ||
		  targetTypeSelect.value === 'esp32forth') {
	    newlineMode.selectedIndex = 0;
	}
    });
    const clearTerminalButton = document.getElementById('clearTerminal');
    clearTerminalButton.addEventListener('click', () => {
	currentTermTab.term.clear();
	currentTermTab.term.reset();
	currentTermTab.currentData = [];
    });
    const saveTerminalButton = document.getElementById('saveTerminal');
    saveTerminalButton.addEventListener('click', async () => {
	await saveTerminal(currentTermTab);
    });
    const saveEditButton = document.getElementById('saveEdit');
    saveEditButton.addEventListener('click', async () => {
	await saveEdit();
    });
    const connectButton = document.getElementById('connect');
    connectButton.addEventListener('click', async () => {
	try {
	    await connect(currentTermTab);
	} catch(e) {
	}
    });
    const disconnectButton = document.getElementById('disconnect');
    disconnectButton.addEventListener('click', async () => {
	await disconnect(currentTermTab);
    });
    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', () => {
	try {
	    clearArea();
	} catch(e) {
	}
    });
    const appendFileButton = document.getElementById('appendFile');
    appendFileButton.addEventListener('click', () => {
	try {
	    appendFile();
	} catch(e) {
	}
    });
    const expandIncludesButton = document.getElementById('expandIncludes');
    expandIncludesButton.addEventListener('click', () => {
	try {
	    expandIncludes();
	} catch(e) {
	}
    });
    const setWorkingDirButton = document.getElementById('setWorkingDir');
    setWorkingDirButton.addEventListener('click', async () => {
	await selectWorkingDir();
    });
    const setGlobalSymbolsButton = document.getElementById('setGlobalSymbols');
    setGlobalSymbolsButton.addEventListener('click', () => {
	try {
	    setGlobalSymbols();
	} catch(e) {
	}
    });
    const clearGlobalSymbolsButton =
	  document.getElementById('clearGlobalSymbols');
    clearGlobalSymbolsButton.addEventListener('click', () => {
	globalSymbols = new Map();
	infoMsg('Global symbols cleared\r\n');
    });
    const helpButton = document.getElementById('help');
    helpButton.addEventListener('click', () => {
	help();
    });
    const licenseButton = document.getElementById('license');
    licenseButton.addEventListener('click', () => {
	license();
    });
    const lineInput = document.getElementById('line');
    const historyDropdown = document.getElementById('history');
    historyDropdown.addEventListener('change', () => {
	currentHistoryIdx = historyDropdown.selectedIndex;
	lineInput.value = historyDropdown.value;
	historyDropdown.selectedIndex = -1;
    });
    document.addEventListener('keydown', event => {
	if(event.key == 'q' &&
	   event.ctrlKey &&
	   !event.shiftKey &&
	   !event.metaKey &&
	   !event.altKey &&
	   currentTermTab.port != null) {
	    interrupt(currentTermTab);
	}
    });
    const interruptButton = document.getElementById('interrupt');
    interruptButton.addEventListener('click', event => {
	if(currentTermTab.port) {
	    interrupt(currentTermTab);
	}
    });
    const promptButton = document.getElementById('prompt');
    promptButton.addEventListener('click', event => {
	if(currentTermTab.port) {
	    sendEntry();
	}
    });
    lineInput.addEventListener('keyup', event => {
	if(event.key === 'Enter') {
	    if(currentTermTab.port) {
		sendEntry();
	    }
	}
    });
    lineInput.addEventListener('keydown', async event => {
	if(history.length > 0) {
	    if(event.key === 'ArrowUp') {
		currentHistoryIdx =
		    Math.min(currentHistoryIdx + 1, history.length - 1);
		lineInput.value = history[currentHistoryIdx];
		const end = lineInput.value.length;
		lineInput.setSelectionRange(end, end);
		lineInput.focus();
	    } else if(event.key === 'ArrowDown') {
		currentHistoryIdx =
		    Math.max(currentHistoryIdx - 1, -1);
		if(currentHistoryIdx > -1) {
		    lineInput.value = history[currentHistoryIdx];
		} else {
		    lineInput.value = '';
		}
		const end = lineInput.value.length;
		lineInput.setSelectionRange(end, end);
		lineInput.focus();
	    }
	}
    });
    const sendButton = document.getElementById('send');
    sendButton.addEventListener('click', event => {
	if(currentTermTab.port) {
	    sendArea();
	}
    });
    const sendFileButton = document.getElementById('sendFile');
    sendFileButton.addEventListener('click', event => {
	if(currentTermTab.port) {
	    sendFile();
	}
    });
    await newTermTab('Terminal 1');
    newEditTab('Edit 1');
    populateArea();
    const addTermTabDiv = document.getElementById('addTermTab');
    addTermTabDiv.addEventListener('click', event => {
	newTermTab('Terminal ' + (termTabCount + 1));
    });
    const addEditTabDiv = document.getElementById('addEditTab');
    addEditTabDiv.addEventListener('click', event => {
	newEditTab('Edit ' + (editTabCount + 1));
    });
    infoMsg(currentTermTab, 'Welcome to zeptocom.js\r\n')
    infoMsg(currentTermTab, 'Copyright (c) 2022 Travis Bemann\r\n');
    infoMsg(currentTermTab,
	    'zeptocom.js comes with ABSOLUTELY NO WARRANTY: ' +
	    'it is licensed under the terms of the MIT license.\r\n');
}

