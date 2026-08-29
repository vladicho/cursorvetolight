const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const ui = {
  projectName: document.querySelector("#projectName"),
  projectInput: document.querySelector("#projectInput"),
  fabricWidth: document.querySelector("#fabricWidth"),
  fabricType: document.querySelector("#fabricType"),
  spacing: document.querySelector("#spacing"),
  nestingTimer: document.querySelector("#nestingTimer"),
  separateNestingsBySize: document.querySelector("#separateNestingsBySize"),
  vectorInput: document.querySelector("#vectorInput"),
  importStatus: document.querySelector("#importStatus"),
  autoNest: document.querySelector("#autoNest"),
  cancelNest: document.querySelector("#cancelNest"),
  nestingProgressBar: document.querySelector("#nestingProgressBar"),
  saveProject: document.querySelector("#saveProject"),
  exportSvg: document.querySelector("#exportSvg"),
  exportDxf: document.querySelector("#exportDxf"),
  exportPlt: document.querySelector("#exportPlt"),
  exportMiniMarker: document.querySelector("#exportMiniMarker"),
  modeMove: document.querySelector("#modeMove"),
  modePoints: document.querySelector("#modePoints"),
  modeDraw: document.querySelector("#modeDraw"),
  modePan: document.querySelector("#modePan"),
  modeCalibrate: document.querySelector("#modeCalibrate"),
  modeTrace: document.querySelector("#modeTrace"),
  modeMeasure: document.querySelector("#modeMeasure"),
  finishTrace: document.querySelector("#finishTrace"),
  undoAction: document.querySelector("#undoAction"),
  redoAction: document.querySelector("#redoAction"),
  copyPiece: document.querySelector("#copyPiece"),
  pastePiece: document.querySelector("#pastePiece"),
  canvasPastePiece: document.querySelector('[data-canvas-action="paste-piece"]'),
  zoomOut: document.querySelector("#zoomOut"),
  zoomIn: document.querySelector("#zoomIn"),
  resetView: document.querySelector("#resetView"),
  fitView: document.querySelector("#fitView"),
  snapToGrid: document.querySelector("#snapToGrid"),
  showGrid: document.querySelector("#showGrid"),
  toggleGrid: document.querySelector("#toggleGrid"),
  toggleFloatingToolbar: document.querySelector("#toggleFloatingToolbar"),
  canvasToggleGrid: document.querySelector('[data-canvas-action="toggle-grid"]'),
  gridStep: document.querySelector("#gridStep"),
  addPiece: document.querySelector("#addPiece"),
  imageInput: document.querySelector("#imageInput"),
  cameraPreview: document.querySelector("#cameraPreview"),
  startCamera: document.querySelector("#startCamera"),
  captureCamera: document.querySelector("#captureCamera"),
  stopCamera: document.querySelector("#stopCamera"),
  requestScannerFrame: document.querySelector("#requestScannerFrame"),
  scannerStatus: document.querySelector("#scannerStatus"),
  scannerQr: document.querySelector("#scannerQr"),
  scannerUrl: document.querySelector("#scannerUrl"),
  calibrationLength: document.querySelector("#calibrationLength"),
  digitizeEngine: document.querySelector("#digitizeEngine"),
  arucoMarkerSize: document.querySelector("#arucoMarkerSize"),
  detectAruco: document.querySelector("#detectAruco"),
  autoTrace: document.querySelector("#autoTrace"),
  digitizeStatus: document.querySelector("#digitizeStatus"),
  pieceList: document.querySelector("#pieceList"),
  rotateLeft: document.querySelector("#rotateLeft"),
  rotateRight: document.querySelector("#rotateRight"),
  mirrorPiece: document.querySelector("#mirrorPiece"),
  fitPieceOrigin: document.querySelector("#fitPieceOrigin"),
  centerPieceWidth: document.querySelector("#centerPieceWidth"),
  alignPieceLeft: document.querySelector("#alignPieceLeft"),
  alignPieceTop: document.querySelector("#alignPieceTop"),
  pieceName: document.querySelector("#pieceName"),
  pieceModel: document.querySelector("#pieceModel"),
  pieceSize: document.querySelector("#pieceSize"),
  pieceColor: document.querySelector("#pieceColor"),
  seamAllowance: document.querySelector("#seamAllowance"),
  duplicatePiece: document.querySelector("#duplicatePiece"),
  deletePiece: document.querySelector("#deletePiece"),
  toggleLockPiece: document.querySelector("#toggleLockPiece"),
  addNotch: document.querySelector("#addNotch"),
  deleteNotch: document.querySelector("#deleteNotch"),
  deletePoint: document.querySelector("#deletePoint"),
  gradingStep: document.querySelector("#gradingStep"),
  gradeUp: document.querySelector("#gradeUp"),
  gradeDown: document.querySelector("#gradeDown"),
  gradeLeft: document.querySelector("#gradeLeft"),
  gradeRight: document.querySelector("#gradeRight"),
  gradeCopySize: document.querySelector("#gradeCopySize"),
  gradeCopyColor: document.querySelector("#gradeCopyColor"),
  createGradeCopy: document.querySelector("#createGradeCopy"),
  gradePointNumber: document.querySelector("#gradePointNumber"),
  gradeIncremental: document.querySelector("#gradeIncremental"),
  gradeIncrement: document.querySelector("#gradeIncrement"),
  gradeTableUp: document.querySelector("#gradeTableUp"),
  gradeTableDown: document.querySelector("#gradeTableDown"),
  gradeTableLeft: document.querySelector("#gradeTableLeft"),
  gradeTableRight: document.querySelector("#gradeTableRight"),
  gradeTableZero: document.querySelector("#gradeTableZero"),
  applyGradeTable: document.querySelector("#applyGradeTable"),
  rotation: document.querySelector("#rotation"),
  grainAngle: document.querySelector("#grainAngle"),
  selectionName: document.querySelector("#selectionName"),
  pieceStats: document.querySelector("#pieceStats"),
  headerWidth: document.querySelector("#headerWidth"),
  headerLength: document.querySelector("#headerLength"),
  headerPieces: document.querySelector("#headerPieces"),
  headerEfficiency: document.querySelector("#headerEfficiency"),
  headerGrade: document.querySelector("#headerGrade"),
  headerModels: document.querySelector("#headerModels"),
  headerFile: document.querySelector("#headerFile"),
  headerStatus: document.querySelector("#headerStatus"),
  markerHeader: document.querySelector("#markerHeader"),
  toggleMarkerHeader: document.querySelector("#toggleMarkerHeader"),
  statusMode: document.querySelector("#statusMode"),
  statusPiece: document.querySelector("#statusPiece"),
  statusFabric: document.querySelector("#statusFabric"),
  statusZoom: document.querySelector("#statusZoom"),
  statusCursor: document.querySelector("#statusCursor"),
  statusMessage: document.querySelector("#statusMessage"),
  pieceContextMenu: document.querySelector("#pieceContextMenu"),
  canvasContextMenu: document.querySelector("#canvasContextMenu"),
  floatingPieceToolbar: document.querySelector("#floatingPieceToolbar"),
};

const baseScale = 4;
const origin = { x: 56, y: 66 };
const minimumMarkerLength = 220;
const minimumCanvasSize = { width: 1280, height: 760 };
const maximumCanvasSize = { width: 32000, height: 12000 };
const view = { zoom: 1, panX: 0, panY: 0 };

let mode = "move";
let selectedId = null;
let selectedPointIndex = null;
let dragState = null;
let newPieceCount = 1;
let digitizedCount = 1;
let importedCount = 1;
let backgroundImage = null;
let background = null;
let calibrationPoints = [];
let contourPoints = [];
let measurePoints = [];
let undoStack = [];
let redoStack = [];
let historySuspended = false;
let lockButtonState = null;
let gridButtonState = null;
let pieceClipboard = null;
let floatingToolbarVisible = localStorage.getItem("moldelab_floating_toolbar_v2") !== "0";
let cameraStream = null;
let scannerSocket = null;
let scannerPollTimer = null;
let latestScannerFrameId = null;
let nestingRunning = false;
let nestingCancelRequested = false;
let nestingPreview = null;
let lastNestingStats = null;
let lastNestingPlacedIds = null;
let activeGradeRowIndex = 1;

const pieces = [];

// ── Tab management ──────────────────────────────────────────────
let tabs = [];
let activeTabId = null;
let tabCounter = 0;

function newBlankSnapshot(name = "Novo Projeto") {
  return {
    version: 1,
    app: "MoldeLab",
    projectName: name,
    fabric: { type: "flat", width: 150, spacing: 0, nestingTimer: 3, length: 0 },
    editor: { snapToGrid: false, showGrid: true, gridStep: 1, showMarkerHeader: false, nestingStats: null, nestingPlacedIds: null },
    counters: { newPieceCount: 1, digitizedCount: 1, importedCount: 1 },
    selectedId: null,
    pieces: [],
  };
}

function captureCurrentTabSnapshot() {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;
  tab.snapshot = cloneSnapshot(projectSnapshot());
  tab.undoStack = undoStack.map(cloneSnapshot);
  tab.redoStack = redoStack.map(cloneSnapshot);
}

function isTabDirty(tab) {
  return JSON.stringify(tab.snapshot) !== JSON.stringify(tab.savedSnapshot);
}

function renderTabs() {
  const list = document.getElementById("tabList");
  list.innerHTML = tabs.map((tab) => {
    const active = tab.id === activeTabId ? " active" : "";
    const dirty = isTabDirty(tab) ? " dirty" : "";
    const name = (tab.snapshot?.projectName || "Projeto").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<button class="tab-item${active}${dirty}" data-tab-id="${tab.id}" type="button" role="tab" aria-selected="${tab.id === activeTabId}"><span class="tab-name">${name}</span><span class="tab-close" data-close-tab="${tab.id}" title="Fechar">×</span></button>`;
  }).join("");

  list.querySelectorAll(".tab-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      const closeId = e.target.closest("[data-close-tab]")?.dataset?.closeTab;
      if (closeId) { closeTab(closeId); return; }
      switchTab(el.dataset.tabId);
    });
  });
}

function switchTab(id) {
  if (id === activeTabId) return;
  captureCurrentTabSnapshot();
  activeTabId = id;
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;
  undoStack.splice(0, undoStack.length, ...(tab.undoStack || []).map(cloneSnapshot));
  redoStack.splice(0, redoStack.length, ...(tab.redoStack || []).map(cloneSnapshot));
  restoreSnapshot(tab.snapshot);
  mode = "move";
  view.zoom = tab.view?.zoom || 1;
  view.panX = tab.view?.panX || 0;
  view.panY = tab.view?.panY || 0;
  draw();
  renderTabs();
  updateImportStatus(`Projeto: ${tab.snapshot.projectName}`);
}

function createTab(snapshot, savedSnapshot = null, fileName = null) {
  tabCounter += 1;
  const id = `tab-${tabCounter}`;
  const snap = cloneSnapshot(snapshot);
  tabs.push({
    id,
    snapshot: snap,
    savedSnapshot: cloneSnapshot(savedSnapshot || snap),
    fileName,
    undoStack: [],
    redoStack: [],
    view: { zoom: 1, panX: 0, panY: 0 },
  });
  return id;
}

function closeTab(id) {
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;

  // Update snapshot before checking dirty state
  if (id === activeTabId) captureCurrentTabSnapshot();

  if (isTabDirty(tab)) {
    const name = tab.snapshot?.projectName || "Projeto";
    const choice = confirm(`"${name}" tem alterações não salvas.\nClique OK para salvar antes de fechar, ou Cancelar para fechar sem salvar.`);
    if (choice) {
      // Switch to that tab then save
      if (id !== activeTabId) switchTab(id);
      saveProject();
      // mark clean
      tab.savedSnapshot = cloneSnapshot(tab.snapshot);
    }
  }

  const index = tabs.findIndex((t) => t.id === id);
  tabs.splice(index, 1);

  if (tabs.length === 0) {
    // Always keep at least one tab
    const newId = createTab(newBlankSnapshot());
    activeTabId = newId;
    restoreSnapshot(tabs[0].snapshot);
    undoStack.splice(0, undoStack.length);
    redoStack.splice(0, redoStack.length);
    mode = "move";
    view.zoom = 1; view.panX = 0; view.panY = 0;
    draw();
  } else if (id === activeTabId) {
    const nextTab = tabs[Math.min(index, tabs.length - 1)];
    activeTabId = nextTab.id;
    undoStack.splice(0, undoStack.length, ...(nextTab.undoStack || []).map(cloneSnapshot));
    redoStack.splice(0, redoStack.length, ...(nextTab.redoStack || []).map(cloneSnapshot));
    restoreSnapshot(nextTab.snapshot);
    mode = "move";
    view.zoom = nextTab.view?.zoom || 1;
    view.panX = nextTab.view?.panX || 0;
    view.panY = nextTab.view?.panY || 0;
    draw();
  }

  renderTabs();
}

function openInNewTab(snapshot, savedSnapshot, fileName) {
  captureCurrentTabSnapshot();
  const id = createTab(snapshot, savedSnapshot, fileName);
  activeTabId = id;
  undoStack.splice(0, undoStack.length);
  redoStack.splice(0, redoStack.length);
  restoreSnapshot(snapshot);
  mode = "move";
  view.zoom = 1; view.panX = 0; view.panY = 0;
  draw();
  renderTabs();
}
// ── End tab management ───────────────────────────────────────────

const gradingCopyColors = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ca8a04", "#0891b2"];

function selectedPiece() {
  return pieces.find((piece) => piece.id === selectedId);
}

function centroid(points) {
  const total = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
  return [total[0] / points.length, total[1] / points.length];
}

function transformedPoints(piece) {
  const [cx, cy] = centroid(piece.points);
  const angle = (piece.rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const flip = piece.mirrored ? -1 : 1;

  return piece.points.map(([px, py]) => {
    const localX = (px - cx) * flip;
    const localY = py - cy;
    const rx = localX * cos - localY * sin;
    const ry = localX * sin + localY * cos;
    return [piece.x + cx + rx, piece.y + cy + ry];
  });
}

function inverseTransformedPoint(piece, point) {
  const [cx, cy] = centroid(piece.points);
  const angle = (piece.rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const flip = piece.mirrored ? -1 : 1;
  const dx = point[0] - piece.x - cx;
  const dy = point[1] - piece.y - cy;
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;
  return [cx + localX / flip, cy + localY];
}

function bounds(points) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

function markerLength() {
  const spacing = Math.max(0, Number(ui.spacing.value) || 0);
  if (lastNestingStats) return Math.max(minimumMarkerLength, lastNestingStats.usedLength + spacing * 2);
  const allPoints = pieces.flatMap(transformedPoints);
  if (!allPoints.length) return minimumMarkerLength;
  const box = bounds(allPoints);
  return Math.max(minimumMarkerLength, box.maxX + spacing * 2);
}

function polygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    area += points[index][0] * points[next][1] - points[next][0] * points[index][1];
  }
  return Math.abs(area / 2);
}

function markerStats(pieceList = pieces) {
  const allPoints = pieceList.flatMap(transformedPoints);
  const box = allPoints.length ? bounds(allPoints) : { maxX: 0 };
  const usedLength = Math.max(0, box.maxX);
  const pieceArea = pieceList.reduce((total, piece) => total + polygonArea(transformedPoints(piece)), 0);
  const fabricArea = Math.max(1, Number(ui.fabricWidth.value) * Math.max(usedLength, 1));
  return {
    usedLength,
    pieceArea,
    efficiency: Math.min(100, (pieceArea / fabricArea) * 100),
  };
}

function currentMarkerStats() {
  return lastNestingStats || markerStats();
}

function currentMarkerPieces() {
  if (!lastNestingPlacedIds) return pieces;
  const placedIds = new Set(lastNestingPlacedIds);
  return pieces.filter((piece) => placedIds.has(piece.id));
}

function isPieceOutsideAppliedNesting(piece) {
  return Boolean(lastNestingPlacedIds && !lastNestingPlacedIds.includes(piece.id));
}

function validNestingStats(stats) {
  if (!stats || typeof stats !== "object") return null;
  const usedLength = Number(stats.usedLength);
  const pieceArea = Number(stats.pieceArea);
  const efficiency = Number(stats.efficiency);
  if (![usedLength, pieceArea, efficiency].every(Number.isFinite)) return null;
  return { usedLength, pieceArea, efficiency };
}

function validPlacedIds(ids) {
  if (!Array.isArray(ids)) return null;
  const existingIds = new Set(pieces.map((piece) => piece.id));
  const placedIds = ids.map(String).filter((id) => existingIds.has(id));
  return placedIds.length ? placedIds : null;
}

function polygonPerimeter(points) {
  let perimeter = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    perimeter += Math.hypot(points[next][0] - points[index][0], points[next][1] - points[index][1]);
  }
  return perimeter;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects = yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function lineSegmentsIntersect(a, b, c, d) {
  const det = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = det(a, b, c);
  const d2 = det(a, b, d);
  const d3 = det(c, d, a);
  const d4 = det(c, d, b);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function polygonsOverlap(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      if (lineSegmentsIntersect(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true;
    }
  }
  return a.some((point) => pointInPolygon(point, b)) || b.some((point) => pointInPolygon(point, a));
}

function worldToScreen(point) {
  return [
    origin.x + view.panX + point[0] * baseScale * view.zoom,
    origin.y + view.panY + point[1] * baseScale * view.zoom,
  ];
}

function screenToWorld(screenX, screenY) {
  return [
    (screenX - origin.x - view.panX) / (baseScale * view.zoom),
    (screenY - origin.y - view.panY) / (baseScale * view.zoom),
  ];
}

function snapPoint(point) {
  if (!ui.snapToGrid.checked) return point;
  const step = Math.max(0.1, Number(ui.gridStep.value) || 1);
  return [
    Math.round(point[0] / step) * step,
    Math.round(point[1] / step) * step,
  ];
}

function eventScreen(event) {
  const rect = canvas.getBoundingClientRect();
  return [
    (event.clientX - rect.left) * (canvas.width / rect.width),
    (event.clientY - rect.top) * (canvas.height / rect.height),
  ];
}

function eventWorld(event) {
  return screenToWorld(...eventScreen(event));
}

function pieceAt(point) {
  for (let index = pieces.length - 1; index >= 0; index -= 1) {
    if (pointInPolygon(point, transformedPoints(pieces[index]))) return pieces[index];
  }
  return null;
}

function vertexAt(screenPoint) {
  const piece = selectedPiece();
  if (!piece) return null;
  const points = transformedPoints(piece);
  for (let index = 0; index < points.length; index += 1) {
    const [x, y] = worldToScreen(points[index]);
    const distance = Math.hypot(screenPoint[0] - x, screenPoint[1] - y);
    if (distance <= 10) return { piece, index };
  }
  return null;
}

function distanceToSegment(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSq = dx * dx + dy * dy;
  if (!lengthSq) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSq));
  const projection = [start[0] + t * dx, start[1] + t * dy];
  return Math.hypot(point[0] - projection[0], point[1] - projection[1]);
}

function edgeAt(screenPoint) {
  const piece = selectedPiece();
  if (!piece) return null;
  const points = transformedPoints(piece);
  for (let index = 0; index < points.length; index += 1) {
    const start = worldToScreen(points[index]);
    const end = worldToScreen(points[(index + 1) % points.length]);
    if (distanceToSegment(screenPoint, start, end) <= 8) {
      return { piece, insertAfter: index };
    }
  }
  return null;
}

function collisionInfo(pieceList = pieces) {
  const collisions = new Set();
  let pairs = 0;
  for (let i = 0; i < pieceList.length; i += 1) {
    for (let j = i + 1; j < pieceList.length; j += 1) {
      if (polygonsOverlap(transformedPoints(pieceList[i]), transformedPoints(pieceList[j]))) {
        collisions.add(pieceList[i].id);
        collisions.add(pieceList[j].id);
        pairs += 1;
      }
    }
  }
  return { ids: collisions, pairs };
}

function markerIssueInfo(pieceList = currentMarkerPieces()) {
  const collisions = collisionInfo(pieceList);
  const fabricWidth = Number(ui.fabricWidth.value);
  const outsideWidth = pieceList.filter((piece) => {
    const box = bounds(transformedPoints(piece));
    return box.minY < 0 || box.maxY > fabricWidth;
  });
  return {
    collisions,
    outsideWidth,
    hasIssues: collisions.pairs > 0 || outsideWidth.length > 0,
  };
}

function markerIssueMessage(issues) {
  const parts = [];
  if (issues.collisions.pairs) parts.push(`${issues.collisions.pairs} colisao(oes)`);
  if (issues.outsideWidth.length) parts.push(`${issues.outsideWidth.length} peca(s) fora da largura`);
  return parts.join(" e ");
}

function summarizePieceLabels(pieceList, limit = 3) {
  const labels = pieceList.slice(0, limit).map(pieceDisplayLabel);
  const extra = pieceList.length - labels.length;
  return `${labels.join(", ")}${extra > 0 ? ` e mais ${extra}` : ""}`;
}

function placementInfo(piece, rotation = piece.rotation) {
  const rotatedPiece = { ...piece, x: 0, y: 0, rotation };
  const box = bounds(transformedPoints(rotatedPiece));
  return {
    box,
    width: box.maxX - box.minX,
    height: box.maxY - box.minY,
  };
}

function placedPieceInfo(piece) {
  const points = transformedPoints(piece);
  return {
    piece,
    points,
    box: bounds(points),
  };
}

function boxesTooClose(a, b, spacing) {
  return !(a.maxX + spacing <= b.minX || b.maxX + spacing <= a.minX || a.maxY + spacing <= b.minY || b.maxY + spacing <= a.minY);
}

function placementFits(points, box, placed, fabricWidth, spacing) {
  if (box.minY < spacing || box.maxY > fabricWidth - spacing) return false;
  if (box.minX < spacing) return false;
  return placed.every((item) => !boxesTooClose(box, item.box, spacing) || !polygonsOverlap(points, item.points));
}

function candidateCoordinates(placed, spacing, startX = spacing, fixedY = null, itemSize = { width: 0, height: 0 }) {
  const xValues = new Set([Number(startX.toFixed(2)), Number(spacing.toFixed(2))]);
  const yValues = new Set([Number(spacing.toFixed(2))]);

  placed.forEach(({ box }) => {
    xValues.add(Number((box.maxX + spacing).toFixed(2)));
    xValues.add(Number(Math.max(spacing, box.minX).toFixed(2)));
    xValues.add(Number((box.minX - itemSize.width - spacing).toFixed(2)));
    yValues.add(Number((box.maxY + spacing).toFixed(2)));
    yValues.add(Number(Math.max(spacing, box.minY).toFixed(2)));
    yValues.add(Number((box.minY - itemSize.height - spacing).toFixed(2)));
  });

  return {
    xValues: [...xValues].filter((value) => value >= spacing).sort((a, b) => a - b),
    yValues: fixedY === null ? [...yValues].filter((value) => value >= spacing).sort((a, b) => a - b) : [fixedY],
  };
}

function grainSafeRotations(piece) {
  const grain = Number(piece.grainAngle || 0) % 360;
  const opposite = (grain + 180) % 360;
  return piece.nestingRotationBias === 180 ? [...new Set([opposite, grain])] : [...new Set([grain, opposite])];
}

function findBestPlacement(piece, placed, fabricWidth, spacing, options = {}) {
  const startX = options.startX ?? spacing;
  const fixedY = options.fixedY ?? null;
  let best = null;

  grainSafeRotations(piece).forEach((rotation) => {
    const info = placementInfo(piece, rotation);
    const { xValues, yValues } = candidateCoordinates(placed, spacing, startX, fixedY, info);
    xValues.forEach((candidateX) => {
      yValues.forEach((candidateY) => {
        const x = candidateX - info.box.minX;
        const y = candidateY - info.box.minY;
        const testPiece = { ...piece, x, y, rotation };
        const points = transformedPoints(testPiece);
        const box = bounds(points);
        if (!placementFits(points, box, placed, fabricWidth, spacing)) return;
        const usedLength = Math.max(...placed.map((item) => item.box.maxX), 0, box.maxX);
        const score = usedLength * 100000 + box.minX * 100 + box.minY;
        if (!best || score < best.score) {
          best = { x, y, rotation, points, box, score };
        }
      });
    });
  });

  return best;
}

function applyPlacement(piece, placement, placed) {
  piece.rotation = placement.rotation;
  piece.x = placement.x;
  piece.y = placement.y;
  placed.push({ piece, points: placement.points, box: placement.box });
}

function appendPlacementAtEnd(piece, placed, fabricWidth, spacing) {
  const rightEdge = Math.max(...placed.map((item) => item.box.maxX), spacing);
  const candidates = grainSafeRotations(piece)
    .map((rotation) => {
      const info = placementInfo(piece, rotation);
      const availableHeight = fabricWidth - spacing * 2;
      if (info.height > availableHeight + 0.01) return null;
      const x = rightEdge + spacing - info.box.minX;
      const y = spacing - info.box.minY;
      const testPiece = { ...piece, x, y, rotation };
      const points = transformedPoints(testPiece);
      const box = bounds(points);
      if (!placementFits(points, box, placed, fabricWidth, spacing)) return null;
      return { x, y, rotation, points, box, score: box.maxX * 1000 + info.height };
    })
    .filter(Boolean);
  return candidates.sort((a, b) => a.score - b.score)[0] || null;
}

function candidateLeftEdges(piece, others, spacing) {
  const currentBox = bounds(transformedPoints(piece));
  const values = new Set([Number(spacing.toFixed(2)), Number(currentBox.minX.toFixed(2))]);
  others.forEach(({ box }) => {
    if (box.maxX + spacing < currentBox.minX) values.add(Number((box.maxX + spacing).toFixed(2)));
  });
  return [...values].filter((value) => value <= currentBox.minX + 0.01).sort((a, b) => a - b);
}

function candidateTopEdges(piece, others, fabricWidth, spacing) {
  const currentBox = bounds(transformedPoints(piece));
  const height = currentBox.maxY - currentBox.minY;
  const values = new Set([
    Number(currentBox.minY.toFixed(2)),
    Number(spacing.toFixed(2)),
    Number(Math.max(spacing, fabricWidth - height - spacing).toFixed(2)),
  ]);
  others.forEach(({ box }) => {
    values.add(Number(Math.max(spacing, box.maxY + spacing).toFixed(2)));
    values.add(Number(Math.max(spacing, box.minY).toFixed(2)));
  });
  return [...values]
    .filter((value) => value >= spacing && value + height <= fabricWidth - spacing)
    .sort((a, b) => a - b);
}

function compactPieceLeft(piece, allPieces, fabricWidth, spacing, allowVertical = true) {
  const others = allPieces.filter((item) => item.id !== piece.id).map(placedPieceInfo);
  const originalBox = bounds(transformedPoints(piece));
  let best = null;
  for (const leftEdge of candidateLeftEdges(piece, others, spacing)) {
    const topEdges = allowVertical ? candidateTopEdges(piece, others, fabricWidth, spacing) : [originalBox.minY];
    for (const topEdge of topEdges) {
      if (Math.abs(leftEdge - originalBox.minX) < 0.01 && Math.abs(topEdge - originalBox.minY) < 0.01) continue;
      const testPiece = {
        ...piece,
        x: piece.x + leftEdge - originalBox.minX,
        y: piece.y + topEdge - originalBox.minY,
      };
      const points = transformedPoints(testPiece);
      const box = bounds(points);
      if (!placementFits(points, box, others, fabricWidth, spacing)) continue;
      const score = box.maxX * 100000 + box.minX * 100 + box.minY;
      if (!best || score < best.score) best = { x: testPiece.x, y: testPiece.y, score };
    }
  }
  if (best) {
    piece.x = best.x;
    piece.y = best.y;
    return true;
  }
  return false;
}

function compactNestingPieces(candidatePieces, lockedPieces, fixedYPieces, fabricWidth, spacing) {
  const lockedIds = new Set(lockedPieces.map((piece) => piece.id));
  const fixedYIds = new Set(fixedYPieces.map((piece) => piece.id));
  const movablePieces = candidatePieces
    .filter((piece) => !lockedIds.has(piece.id))
    .sort((a, b) => bounds(transformedPoints(a)).minX - bounds(transformedPoints(b)).minX);
  for (let round = 0; round < 3; round += 1) {
    let moved = false;
    movablePieces.forEach((piece) => {
      moved = compactPieceLeft(piece, candidatePieces, fabricWidth, spacing, !fixedYIds.has(piece.id)) || moved;
    });
    if (!moved) break;
  }
}

function runNestingPass(lockedPieces, foldPieces, regularPieces, fabricWidth, spacing) {
  const placed = lockedPieces.map(placedPieceInfo);
  const placedIds = new Set();
  let foldStartX = spacing;

  foldPieces.forEach((piece) => {
    const info = placementInfo(piece, Number(piece.grainAngle || 0) % 360);
    const topPlacement = findBestPlacement(piece, placed, fabricWidth, spacing, { startX: spacing, fixedY: spacing });
    const bottomY = Math.max(spacing, fabricWidth - info.height - spacing);
    const bottomPlacement = findBestPlacement(piece, placed, fabricWidth, spacing, { startX: spacing, fixedY: bottomY });
    const placement =
      bottomPlacement && (!topPlacement || bottomPlacement.score < topPlacement.score) ? bottomPlacement : topPlacement;

    if (!placement) return;
    applyPlacement(piece, placement, placed);
    placedIds.add(piece.id);
    foldStartX = Math.max(foldStartX, placement.box.maxX + spacing);
  });

  regularPieces.forEach((piece) => {
    const placement = findBestPlacement(piece, placed, fabricWidth, spacing, { startX: foldPieces.length ? foldStartX : spacing });
    if (!placement) return;
    applyPlacement(piece, placement, placed);
    placedIds.add(piece.id);
  });

  [...foldPieces, ...regularPieces].forEach((piece) => {
    if (placedIds.has(piece.id)) return;
    const placement = appendPlacementAtEnd(piece, placed, fabricWidth, spacing);
    if (!placement) return;
    applyPlacement(piece, placement, placed);
    placedIds.add(piece.id);
  });

  const candidatePieces = [
    ...lockedPieces,
    ...foldPieces.filter((piece) => placedIds.has(piece.id)),
    ...regularPieces.filter((piece) => placedIds.has(piece.id)),
  ];
  compactNestingPieces(candidatePieces, lockedPieces, foldPieces, fabricWidth, spacing);
  const placements = new Map(
    candidatePieces
      .map((piece) => [piece.id, { x: piece.x, y: piece.y, rotation: piece.rotation }]),
  );
  const stats = markerStats(candidatePieces);
  const requestedCount = foldPieces.length + regularPieces.length;
  const missingCount = requestedCount - placements.size;
  const areaWaste = Math.max(0, fabricWidth * Math.max(stats.usedLength, 1) - stats.pieceArea);
  return {
    placements,
    stats,
    placedCount: placements.size,
    missingCount,
    score: missingCount * 1000000000000 + areaWaste * 1000 + stats.usedLength,
  };
}

function runSeparatedNestingPass(groups, lockedPieces, fabricWidth, spacing) {
  const combinedPieces = [];
  const placements = new Map();
  let cursor = 0;
  let missingCount = 0;

  groups.forEach((group, groupIndex) => {
    const clone = (piece) => ({ ...piece, points: piece.points.map((point) => [...point]) });
    const clonedLocked = groupIndex === 0 ? lockedPieces.map(clone) : [];
    const clonedFold = group.foldPieces.map(clone);
    const clonedRegular = group.regularPieces.map(clone);
    const result = runNestingPass(clonedLocked, clonedFold, clonedRegular, fabricWidth, spacing);
    const groupPieces = [...clonedLocked, ...clonedFold, ...clonedRegular].filter((piece) => result.placements.has(piece.id));
    missingCount += result.missingCount;
    if (!groupPieces.length) return;

    const localBounds = bounds(groupPieces.flatMap(transformedPoints));
    const offset = cursor - localBounds.minX;
    groupPieces.forEach((piece) => {
      piece.x += offset;
      combinedPieces.push(piece);
      const placement = result.placements.get(piece.id);
      if (placement) placements.set(piece.id, { ...placement, x: placement.x + offset });
    });
    cursor = Math.max(cursor, bounds(groupPieces.flatMap(transformedPoints)).maxX + spacing);
  });

  const stats = markerStats(combinedPieces);
  const areaWaste = Math.max(0, fabricWidth * Math.max(stats.usedLength, 1) - stats.pieceArea);
  return {
    placements,
    stats,
    placedCount: placements.size,
    missingCount,
    score: missingCount * 1000000000000 + areaWaste * 1000 + stats.usedLength,
  };
}

function drawRulers(length, width) {
  ctx.fillStyle = "#5d6966";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let cm = 0; cm <= length; cm += 10) {
    const [x, y] = worldToScreen([cm, 0]);
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y - 22);
    ctx.stroke();
    ctx.fillText(String(cm), x, y - 32);
  }

  ctx.textAlign = "right";
  for (let cm = 0; cm <= width; cm += 10) {
    const [x, y] = worldToScreen([0, cm]);
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x - 22, y);
    ctx.stroke();
    ctx.fillText(String(cm), x - 28, y);
  }
}

function drawFabric() {
  const width = Number(ui.fabricWidth.value);
  const length = markerLength();
  const isTubular = ui.fabricType.value === "tubular";
  const gridStep = Math.max(0.5, Number(ui.gridStep.value) || 1);
  const [x, y] = worldToScreen([0, 0]);
  const w = length * baseScale * view.zoom;
  const h = width * baseScale * view.zoom;

  ctx.fillStyle = "#f9faf7";
  ctx.strokeStyle = "#a8b4ad";
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  if (ui.showGrid.checked) {
    ctx.strokeStyle = "#d8e0db";
    ctx.lineWidth = 1;
    for (let cm = gridStep; cm < length; cm += gridStep) {
      const [gx] = worldToScreen([cm, 0]);
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
    }
    for (let cm = gridStep; cm < width; cm += gridStep) {
      const [, gy] = worldToScreen([0, cm]);
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }
  }

  drawRulers(length, width);

  ctx.fillStyle = "#5d6966";
  ctx.font = "13px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`${isTubular ? "Tecido tubular" : "Tecido plano"} - comprimento ${length.toFixed(1)} cm`, x + w, y - 14);

  if (isTubular) {
    ctx.save();
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#111827";
    ctx.font = "700 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("DOBRA TUBULAR", x + w / 2, y + 16);
    ctx.fillText("DOBRA TUBULAR", x + w / 2, y + h - 10);
    ctx.restore();
  }
}

function drawMarkerEndLine() {
  const stats = currentMarkerStats();
  if (stats.usedLength <= 0) return;
  const fabricWidth = Number(ui.fabricWidth.value);
  const [x, topY] = worldToScreen([stats.usedLength, 0]);
  const [, bottomY] = worldToScreen([stats.usedLength, fabricWidth]);
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.fillStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, bottomY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "700 12px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`FIM ${stats.usedLength.toFixed(1)} cm`, x - 8, topY + 8);
  ctx.restore();
}

function drawVertices(piece) {
  if (mode !== "points" || selectedId !== piece.id) return;
  const pieceColor = safePieceColor(piece.color);
  transformedPoints(piece).forEach((point, index) => {
    const [x, y] = worldToScreen(point);
    const hasNotch = piece.notches?.includes(index);
    ctx.beginPath();
    ctx.arc(x, y, selectedPointIndex === index ? 8 : 6, 0, Math.PI * 2);
    ctx.fillStyle = selectedPointIndex === index ? "#facc15" : hasNotch ? "#be123c" : index === 0 ? "#111827" : "#ffffff";
    ctx.strokeStyle = pieceColor;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  });
}

function notchSegments(piece, points) {
  return (piece.notches || [])
    .filter((pointIndex) => pointIndex >= 0 && pointIndex < points.length)
    .map((pointIndex) => {
      const previous = points[(pointIndex - 1 + points.length) % points.length];
      const current = points[pointIndex];
      const next = points[(pointIndex + 1) % points.length];
      const tangent = [next[0] - previous[0], next[1] - previous[1]];
      const tangentLength = Math.hypot(tangent[0], tangent[1]) || 1;
      const normal = [-tangent[1] / tangentLength, tangent[0] / tangentLength];
      const length = 1.6;
      return {
        pointIndex,
        start: [current[0] - normal[0] * length * 0.5, current[1] - normal[1] * length * 0.5],
        end: [current[0] + normal[0] * length * 0.5, current[1] + normal[1] * length * 0.5],
      };
    });
}

function seamAllowancePoints(piece, points) {
  const amount = Number(piece.seamAllowance) || 0;
  if (amount <= 0 || points.length < 3) return [];
  const [cx, cy] = centroid(points);
  return points.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const length = Math.hypot(dx, dy) || 1;
    return [x + (dx / length) * amount, y + (dy / length) * amount];
  });
}

function drawPolyline(points, closePath = true) {
  if (!points.length) return;
  const canvasPoints = points.map(worldToScreen);
  ctx.beginPath();
  canvasPoints.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (closePath) ctx.closePath();
}

function drawSeamAllowance(piece, points) {
  const seamPoints = seamAllowancePoints(piece, points);
  if (!seamPoints.length) return;
  ctx.save();
  ctx.setLineDash([8, 5]);
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = selectedId === piece.id ? 2.5 : 1.5;
  drawPolyline(seamPoints, true);
  ctx.stroke();
  ctx.restore();
}

function drawNotches(piece, points) {
  const segments = notchSegments(piece, points);
  if (!segments.length) return;
  ctx.save();
  ctx.strokeStyle = "#be123c";
  ctx.lineWidth = 3;
  segments.forEach(({ start, end }) => {
    const a = worldToScreen(start);
    const b = worldToScreen(end);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  });
  ctx.restore();
}

function drawGrainline(piece, points) {
  const box = bounds(points);
  const centerX = (box.minX + box.maxX) / 2;
  const centerY = (box.minY + box.maxY) / 2;
  const length = Math.max(12, Math.min(box.maxX - box.minX, box.maxY - box.minY) * 0.55);
  const angle = (((piece.grainAngle || 0) % 360) * Math.PI) / 180;
  const dx = Math.sin(angle) * length * 0.5;
  const dy = Math.cos(angle) * length * 0.5;
  const start = worldToScreen([centerX - dx, centerY - dy]);
  const end = worldToScreen([centerX + dx, centerY + dy]);

  ctx.save();
  ctx.strokeStyle = "#1d4ed8";
  ctx.fillStyle = "#1d4ed8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(start[0], start[1]);
  ctx.lineTo(end[0], end[1]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(end[0], end[1]);
  ctx.lineTo(end[0] - 7, end[1] - 10);
  ctx.lineTo(end[0] + 7, end[1] - 10);
  ctx.closePath();
  ctx.fill();

  ctx.font = "700 11px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`FIO ${piece.grainAngle || 0}`, start[0], start[1] - 8);
  ctx.restore();
}

function drawPiece(piece, hasCollision, outsideAppliedNesting = false) {
  const points = transformedPoints(piece);
  const pieceColor = safePieceColor(piece.color);
  ctx.save();
  if (outsideAppliedNesting) {
    ctx.globalAlpha = 0.42;
    ctx.setLineDash([9, 6]);
  }
  drawPolyline(points, true);
  ctx.fillStyle = hasCollision ? "rgba(194, 65, 12, 0.18)" : `${pieceColor}26`;
  ctx.strokeStyle = hasCollision ? "#c2410c" : pieceColor;
  ctx.lineWidth = selectedId === piece.id ? 4 : 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  if (piece.locked) {
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    drawPolyline(points, true);
    ctx.stroke();
    ctx.restore();
  }

  const box = bounds(points);
  const label = worldToScreen([box.minX + 2, box.minY + 5]);
  ctx.save();
  if (outsideAppliedNesting) ctx.globalAlpha = 0.62;
  ctx.fillStyle = "#1d2424";
  ctx.font = "700 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText(pieceDisplayLabel(piece), label[0], label[1]);
  ctx.restore();
  drawSeamAllowance(piece, points);
  drawGrainline(piece, points);
  drawNotches(piece, points);
  drawVertices(piece);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[char]
  ));
}

function safePieceColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#475569";
}

function nextGradingColor(sourceColor) {
  const usedColors = new Set(pieces.map((piece) => safePieceColor(piece.color).toLowerCase()));
  const source = safePieceColor(sourceColor).toLowerCase();
  return gradingCopyColors.find((color) => color.toLowerCase() !== source && !usedColors.has(color.toLowerCase()))
    || gradingCopyColors.find((color) => color.toLowerCase() !== source)
    || "#dc2626";
}

function gradeCopyId(baseId, size) {
  const safeSize = String(size || "grade").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "grade";
  return `grade-${baseId}-${safeSize}`;
}

function iconButtonMarkup(icon, label) {
  return `<i data-lucide="${icon}"></i><span>${label}</span>`;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  document.querySelectorAll("button").forEach((button) => {
    if (button.querySelector("svg, [data-lucide]")) {
      button.classList.add("icon-action");
    }
  });
}

function closeMenus(exceptMenu) {
  document.querySelectorAll(".menu-dropdown[open]").forEach((menu) => {
    if (menu !== exceptMenu) {
      menu.removeAttribute("open");
    }
  });
  closePieceContextMenu();
  closeCanvasContextMenu();
}

function closePieceContextMenu() {
  ui.pieceContextMenu.hidden = true;
}

function closeCanvasContextMenu() {
  ui.canvasContextMenu.hidden = true;
}

function placeContextMenu(menu, event) {
  menu.hidden = false;
  const rect = menu.getBoundingClientRect();
  const left = Math.min(event.clientX, window.innerWidth - rect.width - 8);
  const top = Math.min(event.clientY, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;
}

function updatePieceContextMenu() {
  const piece = selectedPiece();
  const lockButton = ui.pieceContextMenu.querySelector('[data-context-action="lock"]');
  const pointButtons = ui.pieceContextMenu.querySelectorAll('[data-context-action="add-notch"], [data-context-action="delete-notch"], [data-context-action="delete-point"]');
  const lockedButtons = ui.pieceContextMenu.querySelectorAll(
    '[data-context-action="delete"], [data-context-action="grade-copy"], [data-context-action="rotate-left"], [data-context-action="rotate-right"], [data-context-action="mirror"], [data-context-action="origin"], [data-context-action="center-width"], [data-context-action="left"], [data-context-action="top"]',
  );
  if (!piece || !lockButton) return;
  lockButton.innerHTML = piece.locked
    ? iconButtonMarkup("unlock", "Desbloquear peca")
    : iconButtonMarkup("lock", "Bloquear peca");
  lockedButtons.forEach((button) => {
    button.disabled = piece.locked;
  });
  pointButtons.forEach((button) => {
    button.disabled = piece.locked || selectedPointIndex === null;
  });
  refreshIcons();
}

function openPieceContextMenu(event, piece) {
  closeMenus();
  selectedId = piece.id;
  const vertex = vertexAt(eventScreen(event));
  selectedPointIndex = vertex?.piece.id === piece.id ? vertex.index : null;
  mode = selectedPointIndex === null ? "move" : "points";
  updatePieceContextMenu();
  placeContextMenu(ui.pieceContextMenu, event);
  updateImportStatus(`Peca selecionada: ${piece.name}.`);
  draw();
}

function openCanvasContextMenu(event) {
  closeMenus();
  selectedPointIndex = null;
  placeContextMenu(ui.canvasContextMenu, event);
  updateImportStatus("Menu do canvas aberto.");
}

function setupMenuBehavior() {
  document.querySelectorAll(".menu-dropdown").forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (menu.open) closeMenus(menu);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".menu-dropdown") && !event.target.closest(".context-menu")) closeMenus();
  });

  document.querySelectorAll(".menu-dropdown button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.keepMenuOpen === "true") return;
      button.closest("details")?.removeAttribute("open");
    });
  });
}

function isTypingTarget(target) {
  return target.closest("input, textarea, select, [contenteditable='true']");
}

function pieceMetaLabel(piece) {
  return [piece.model, piece.size].map((value) => String(value || "").trim()).filter(Boolean).join(" / ");
}

function pieceDisplayLabel(piece) {
  const meta = pieceMetaLabel(piece);
  return meta ? `${piece.name} - ${meta}` : piece.name;
}

function modeLabel() {
  const labels = {
    move: "Mover",
    points: "Pontos",
    draw: "Desenhar",
    pan: "Pan",
    calibrate: "Calibrar",
    trace: "Digitalizar",
    measure: "Medir",
  };
  return labels[mode] || mode;
}

function updateGridButtons() {
  const nextState = ui.showGrid.checked ? "visible" : "hidden";
  if (gridButtonState === nextState) return;
  const label = ui.showGrid.checked ? "Ocultar grade" : "Mostrar grade";
  ui.toggleGrid.innerHTML = `${iconButtonMarkup("grid-2x2", label)}<kbd>G</kbd>`;
  ui.canvasToggleGrid.innerHTML = iconButtonMarkup("grid-2x2", label);
  gridButtonState = nextState;
  refreshIcons();
}

function updateFloatingToolbar() {
  const toolbar = ui.floatingPieceToolbar;
  const piece = selectedPiece();
  if (!toolbar) return;
  if (!floatingToolbarVisible || !piece) {
    toolbar.hidden = true;
    return;
  }

  toolbar.hidden = false;
  const canvasRect = canvas.getBoundingClientRect();
  const box = bounds(transformedPoints(piece).map((point) => {
    const [x, y] = worldToScreen(point);
    return [
      canvasRect.left + (x / canvas.width) * canvasRect.width,
      canvasRect.top + (y / canvas.height) * canvasRect.height,
    ];
  }));
  const toolbarWidth = toolbar.offsetWidth || 440;
  const toolbarHeight = toolbar.offsetHeight || 44;
  const rawLeft = box.maxX + 12;
  const rawTop = box.minY;
  const maxLeft = window.innerWidth - toolbarWidth - 10;
  const maxTop = window.innerHeight - toolbarHeight - 10;
  toolbar.style.left = `${Math.max(10, Math.min(rawLeft, maxLeft))}px`;
  toolbar.style.top = `${Math.max(10, Math.min(rawTop, maxTop))}px`;

  toolbar.querySelectorAll('[data-float-action="duplicate"], [data-float-action="grade-copy"], [data-float-action="rotate-left"], [data-float-action="rotate-right"], [data-float-action="mirror"], [data-float-action^="grade-"]').forEach((button) => {
    button.disabled = piece.locked;
  });
  toolbar.querySelectorAll('[data-float-action="grade-left"], [data-float-action="grade-right"], [data-float-action="grade-up"], [data-float-action="grade-down"]').forEach((button) => {
    button.disabled = piece.locked || selectedPointIndex === null;
  });
  const lockButton = toolbar.querySelector('[data-float-action="lock"]');
  if (lockButton) {
    lockButton.innerHTML = piece.locked ? iconButtonMarkup("unlock", "Desbloquear") : iconButtonMarkup("lock", "Bloquear");
  }
}

function updateClipboardButtons() {
  ui.pastePiece.disabled = !pieceClipboard;
  ui.canvasPastePiece.disabled = !pieceClipboard;
}

function renderPieceList() {
  ui.pieceList.innerHTML = pieces
    .map((piece, index) => {
      const pointCount = piece.points.length;
      const notchCount = piece.notches?.length || 0;
      const seam = Number(piece.seamAllowance || 0).toFixed(1);
      const active = selectedId === piece.id ? " active" : "";
      const lockLabel = piece.locked ? " · bloqueada" : "";
      const color = safePieceColor(piece.color);
      const label = pieceDisplayLabel(piece);
      return `<button class="piece-list-item${active}" data-piece-id="${piece.id}">
        <span><i style="background:${color}"></i>${index + 1}. ${escapeHtml(label)}</span>
        <small>${pointCount} pts · ${notchCount} piques · ${seam} cm${lockLabel}</small>
      </button>`;
    })
    .join("");
}

function renderPieceStats(piece) {
  if (!piece) {
    ui.pieceStats.innerHTML = "";
    return;
  }
  const points = transformedPoints(piece);
  const box = bounds(points);
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  const area = polygonArea(points);
  const perimeter = polygonPerimeter(points);
  const seam = Number(piece.seamAllowance || 0);
  const notches = piece.notches?.length || 0;
  ui.pieceStats.innerHTML = `
    <div><span>${width.toFixed(1)} cm</span><p>Largura</p></div>
    <div><span>${height.toFixed(1)} cm</span><p>Altura</p></div>
    <div><span>${area.toFixed(1)} cm2</span><p>Area</p></div>
    <div><span>${perimeter.toFixed(1)} cm</span><p>Perimetro</p></div>
    <div><span>${piece.points.length}</span><p>Pontos</p></div>
    <div><span>${notches}</span><p>Piques</p></div>
    <div><span>${seam.toFixed(1)} cm</span><p>Margem</p></div>
    <div><span>${piece.grainAngle || 0}</span><p>Fio</p></div>
  `;
}

function uniqueFilled(values) {
  const cleaned = values.map((value) => String(value || "").trim()).filter(Boolean);
  return [...new Set(cleaned)];
}

function fitHeaderText(values, fallback = "-") {
  if (!values.length) return fallback;
  const text = values.join(", ");
  return text.length > 42 ? `${text.slice(0, 39)}...` : text;
}

function markerHeaderData(stats = markerStats()) {
  const markerPieces = currentMarkerPieces();
  const grade = uniqueFilled(markerPieces.map((piece) => piece.size));
  const models = uniqueFilled(markerPieces.map((piece) => piece.model || piece.name));
  const issues = markerIssueInfo(markerPieces);
  return [
    ["Largura", `${Number(ui.fabricWidth.value).toFixed(0)} cm`],
    ["Comprimento", `${stats.usedLength.toFixed(1)} cm`],
    ["Pecas encaixadas", String(markerPieces.length)],
    ["Aproveitamento", `${stats.efficiency.toFixed(1)}%`],
    ["Grade", fitHeaderText(grade)],
    ["Modelos", fitHeaderText(models)],
    ["Arquivo", safeProjectFilename("moldelab.json")],
    ["Status", issues.hasIssues ? `Atencao: ${markerIssueMessage(issues)}` : "OK"],
  ];
}

function updateMarkerHeader(stats) {
  const header = Object.fromEntries(markerHeaderData(stats));
  const statusTitle = header.Status;
  ui.headerWidth.textContent = `${Number(ui.fabricWidth.value).toFixed(0)} cm`;
  ui.headerLength.textContent = header.Comprimento;
  ui.headerPieces.textContent = header["Pecas encaixadas"];
  ui.headerEfficiency.textContent = header.Aproveitamento;
  ui.headerGrade.textContent = header.Grade;
  ui.headerModels.textContent = header.Modelos;
  ui.headerFile.textContent = header.Arquivo;
  ui.headerStatus.textContent = header.Status === "OK" ? "OK" : "Atencao";
  [
    ui.headerWidth,
    ui.headerLength,
    ui.headerPieces,
    ui.headerEfficiency,
    ui.headerGrade,
    ui.headerModels,
    ui.headerFile,
    ui.headerStatus,
  ].forEach((cell) => {
    cell.title = cell === ui.headerStatus ? statusTitle : cell.textContent;
  });
  ui.headerStatus.classList.toggle("warn", header.Status !== "OK");
}

function setMarkerHeaderVisible(visible) {
  const label = visible ? "Ocultar cabecalho" : "Mostrar cabecalho";
  ui.markerHeader.hidden = !visible;
  ui.toggleMarkerHeader.classList.toggle("active", visible);
  ui.toggleMarkerHeader.querySelector("span").textContent = label;
  ui.toggleMarkerHeader.title = label;
  ui.toggleMarkerHeader.setAttribute("aria-expanded", String(visible));
}

function restoreMarkerHeaderPreference(editor = {}) {
  setMarkerHeaderVisible(Boolean(editor.showMarkerHeader));
}

function updateMetrics(collisions) {
  const stats = currentMarkerStats();

  updateMarkerHeader(stats);

  const piece = selectedPiece();
  updateGridButtons();
  updateClipboardButtons();
  ui.statusMode.textContent = modeLabel();
  ui.statusPiece.textContent = piece ? pieceDisplayLabel(piece) : "Nenhuma";
  ui.statusFabric.textContent = `${ui.fabricType.value === "tubular" ? "Tubular" : "Plano"} ${Number(ui.fabricWidth.value).toFixed(0)} cm`;
  ui.statusZoom.textContent = `${Math.round(view.zoom * 100)}%`;
  ui.selectionName.textContent = piece ? pieceDisplayLabel(piece) : "Nenhuma peca";
  ui.pieceName.value = piece ? piece.name : "";
  ui.pieceModel.value = piece ? piece.model || "" : "";
  ui.pieceSize.value = piece ? piece.size || "" : "";
  ui.pieceColor.value = piece ? safePieceColor(piece.color) : "#475569";
  ui.gradePointNumber.value = selectedPointIndex === null ? "-" : String(selectedPointIndex + 1);
  const nextLockButtonState = piece?.locked ? "locked" : "unlocked";
  if (lockButtonState !== nextLockButtonState) {
    ui.toggleLockPiece.innerHTML = piece?.locked
      ? iconButtonMarkup("unlock", "Desbloquear peca")
      : iconButtonMarkup("lock", "Bloquear peca");
    lockButtonState = nextLockButtonState;
    refreshIcons();
  }
  if (document.activeElement !== ui.seamAllowance) {
    ui.seamAllowance.value = piece ? Number(piece.seamAllowance || 0).toFixed(1) : 0;
  }
  ui.rotation.value = piece ? piece.rotation : 0;
  ui.grainAngle.value = String(piece?.grainAngle ?? 0);
  renderPieceStats(piece);
  renderPieceList();
  updateFloatingToolbar();
}

function updateModeButtons() {
  ui.modeMove.classList.toggle("active", mode === "move");
  ui.modePoints.classList.toggle("active", mode === "points");
  ui.modeDraw.classList.toggle("active", mode === "draw");
  ui.modePan.classList.toggle("active", mode === "pan");
  ui.modeCalibrate.classList.toggle("active", mode === "calibrate");
  ui.modeTrace.classList.toggle("active", mode === "trace");
  ui.modeMeasure.classList.toggle("active", mode === "measure");
  ui.undoAction.disabled = undoStack.length === 0;
  ui.redoAction.disabled = redoStack.length === 0;
  canvas.style.cursor = mode === "pan" ? "grab" : mode === "move" ? "move" : "crosshair";
  updateFloatingToolbar();
}

function updateDigitizeStatus(message) {
  ui.digitizeStatus.textContent = message;
  ui.statusMessage.textContent = message;
}

function updateImportStatus(message) {
  ui.importStatus.textContent = message;
  ui.statusMessage.textContent = message;
}

function updateCursorStatus(point) {
  ui.statusCursor.textContent = point ? `${point[0].toFixed(1)}, ${point[1].toFixed(1)} cm` : "-";
}

function drawBackgroundImage() {
  if (!backgroundImage || !background) return;
  const [x, y] = worldToScreen([background.x, background.y]);
  const w = background.widthCm * baseScale * view.zoom;
  const h = background.heightCm * baseScale * view.zoom;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.drawImage(backgroundImage, x, y, w, h);
  ctx.restore();
  ctx.strokeStyle = "#64748b";
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

function drawDigitizeGuides() {
  if (calibrationPoints.length) {
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = "#0f172a";
    calibrationPoints.forEach((point) => {
      const [x, y] = worldToScreen(point);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    if (calibrationPoints.length === 2) {
      const a = worldToScreen(calibrationPoints[0]);
      const b = worldToScreen(calibrationPoints[1]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
  }

  if (!contourPoints.length) return;
  ctx.strokeStyle = "#0891b2";
  ctx.fillStyle = "#0891b2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  contourPoints.forEach((point, index) => {
    const [x, y] = worldToScreen(point);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  if (mode === "draw" || mode === "trace") {
    const [x, y] = worldToScreen(contourPoints[0]);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.strokeStyle = "#0f172a";
    ctx.stroke();
  }
  contourPoints.forEach((point) => {
    const [x, y] = worldToScreen(point);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function measureDistance() {
  if (measurePoints.length !== 2) return 0;
  return Math.hypot(measurePoints[1][0] - measurePoints[0][0], measurePoints[1][1] - measurePoints[0][1]);
}

function drawMeasureGuide() {
  if (!measurePoints.length) return;
  const screenPoints = measurePoints.map(worldToScreen);

  ctx.save();
  ctx.strokeStyle = "#be123c";
  ctx.fillStyle = "#be123c";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);

  if (screenPoints.length === 2) {
    ctx.beginPath();
    ctx.moveTo(screenPoints[0][0], screenPoints[0][1]);
    ctx.lineTo(screenPoints[1][0], screenPoints[1][1]);
    ctx.stroke();

    const midX = (screenPoints[0][0] + screenPoints[1][0]) / 2;
    const midY = (screenPoints[0][1] + screenPoints[1][1]) / 2;
    const label = `${measureDistance().toFixed(2)} cm`;
    ctx.setLineDash([]);
    ctx.font = "700 13px Arial";
    const labelWidth = ctx.measureText(label).width + 14;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff1f2";
    ctx.strokeStyle = "#be123c";
    ctx.fillRect(midX - labelWidth / 2, midY - 15, labelWidth, 24);
    ctx.strokeRect(midX - labelWidth / 2, midY - 15, labelWidth, 24);
    ctx.fillStyle = "#be123c";
    ctx.fillText(label, midX, midY - 3);
  }

  screenPoints.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function syncCanvasSizeToMarker() {
  const fabricWidth = Number(ui.fabricWidth.value);
  const markerWidth = origin.x * 2 + markerLength() * baseScale * view.zoom + 80;
  const markerHeight = origin.y * 2 + fabricWidth * baseScale * view.zoom + 90;
  const nextWidth = Math.min(maximumCanvasSize.width, Math.max(minimumCanvasSize.width, Math.ceil(markerWidth)));
  const nextHeight = Math.min(maximumCanvasSize.height, Math.max(minimumCanvasSize.height, Math.ceil(markerHeight)));
  if (canvas.width !== nextWidth) {
    canvas.width = nextWidth;
    canvas.style.width = `${nextWidth}px`;
  }
  if (canvas.height !== nextHeight) {
    canvas.height = nextHeight;
    canvas.style.height = `${nextHeight}px`;
  }
}

function draw() {
  syncCanvasSizeToMarker();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFabric();
  drawBackgroundImage();
  const collisions = collisionInfo();
  pieces.forEach((piece) => drawPiece(piece, collisions.ids.has(piece.id), isPieceOutsideAppliedNesting(piece)));
  drawNestingPreview();
  drawMarkerEndLine();
  drawDigitizeGuides();
  drawMeasureGuide();
  updateMetrics(collisions);
  updateModeButtons();
}

function waitForNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function previewPiecesFromResult(result) {
  if (!result) return [];
  return pieces
    .map((piece) => {
      const placement = result.placements.get(piece.id);
      if (!placement) return null;
      return {
        ...piece,
        x: placement.x,
        y: placement.y,
        rotation: placement.rotation,
      };
    })
    .filter(Boolean);
}

function drawNestingPreview() {
  if (!nestingPreview?.pieces?.length) return;
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.42;
  nestingPreview.pieces.forEach((piece) => {
    const points = transformedPoints(piece).map(worldToScreen);
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = safePieceColor(piece.color);
    ctx.strokeStyle = "#111827";
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function updateNestingProgress(message = "Calculando encaixe...") {
  if (message === "Calculando encaixe..." && nestingPreview?.stats) {
    const s = nestingPreview.stats;
    ui.statusMessage.textContent = `Calculando... comprimento ${s.usedLength.toFixed(1)} cm, aproveitamento ${s.efficiency.toFixed(1)}%`;
  } else {
    ui.statusMessage.textContent = message;
  }
}

function updateNestingProgressBar(startTime, deadline) {
  const duration = Math.max(1, deadline - startTime);
  const progress = Math.min(100, Math.max(0, ((performance.now() - startTime) / duration) * 100));
  ui.nestingProgressBar.value = progress;
  const progressText = `${progress.toFixed(0)}%`;
  ui.nestingProgressBar.title = `Encaixe ${progressText}`;
  ui.nestingProgressBar.setAttribute("aria-valuetext", progressText);
}

function setNestingInputsLocked(locked) {
  [ui.fabricType, ui.fabricWidth, ui.spacing, ui.nestingTimer].forEach((input) => {
    input.disabled = locked;
  });
}

function setCancelNestActive(active) {
  ui.cancelNest.classList.toggle("danger-action", active);
  if (active) ui.cancelNest.setAttribute("aria-busy", "true");
  else ui.cancelNest.removeAttribute("aria-busy");
}

function cancelNesting() {
  if (!nestingRunning) return;
  nestingCancelRequested = true;
  ui.cancelNest.disabled = true;
  setCancelNestActive(false);
  ui.statusMessage.textContent = "Interrompendo encaixe...";
}

async function autoNest() {
  if (nestingRunning) return;
  nestingRunning = true;
  nestingCancelRequested = false;
  nestingPreview = null;
  ui.autoNest.disabled = true;
  ui.cancelNest.disabled = false;
  setNestingInputsLocked(true);
  setCancelNestActive(true);
  ui.nestingProgressBar.hidden = false;
  ui.nestingProgressBar.value = 0;
  ui.nestingProgressBar.title = "Encaixe 0%";
  ui.nestingProgressBar.setAttribute("aria-valuetext", "0%");
  ui.autoNest.setAttribute("aria-busy", "true");
  const autoNestLabel = ui.autoNest.querySelector("span");
  const originalLabel = autoNestLabel?.textContent || "Encaixe automatico";
  if (autoNestLabel) autoNestLabel.textContent = "Calculando";

  try {
    const spacing = Math.max(0, Number(ui.spacing.value) || 0);
    const fabricWidth = Number(ui.fabricWidth.value);
    const timerSeconds = Math.max(1, Math.min(60, Number(ui.nestingTimer.value) || 3));
    const startTime = performance.now();
    const deadline = startTime + timerSeconds * 1000;
    const isTubular = ui.fabricType.value === "tubular";
    const ordered = [...pieces].sort((a, b) => polygonArea(transformedPoints(b)) - polygonArea(transformedPoints(a)));
    const lockedPieces = pieces.filter((piece) => piece.locked);
    const unlocked = ordered.filter((piece) => !piece.locked);
    const foldPieces = isTubular ? unlocked.filter((piece) => piece.mirrored) : [];
    const regularPieces = unlocked.filter((piece) => !(isTubular && piece.mirrored));
    if (!unlocked.length) {
      updateImportStatus(pieces.length ? "Nenhuma peca desbloqueada para encaixar." : "Crie ou importe pecas antes de encaixar.");
      return;
    }
    const metrics = new Map(
      regularPieces.map((piece) => {
        const info = placementInfo(piece);
        const area = polygonArea(transformedPoints(piece));
        const perimeter = polygonPerimeter(transformedPoints(piece));
        return [
          piece.id,
          {
            area,
            perimeter,
            width: info.width,
            height: info.height,
            ratio: info.width / Math.max(info.height, 0.01),
            fill: area / Math.max(info.width * info.height, 0.01),
          },
        ];
      }),
    );
    const metric = (piece) => metrics.get(piece.id);
    const byMetric = (selector, direction = "desc") =>
      [...regularPieces].sort((a, b) => {
        const value = selector(metric(a)) - selector(metric(b));
        return direction === "asc" ? value : -value;
      });
    const interleaveOrders = (first, second) => {
      const result = [];
      const used = new Set();
      const add = (piece) => {
        if (used.has(piece.id)) return;
        used.add(piece.id);
        result.push(piece);
      };
      for (let index = 0; index < Math.max(first.length, second.length); index += 1) {
        if (first[index]) add(first[index]);
        if (second[index]) add(second[index]);
      }
      return result;
    };
    const withRotationBias = (order, shouldRotate) =>
      order.map((piece, index) => ({
        ...piece,
        nestingRotationBias: shouldRotate(piece, index) ? 180 : 0,
      }));
    const duplicateKey = (piece) => `${piece.model || ""}|${piece.name}|${piece.size || ""}`;
    const withDuplicateRotationBias = (order, offset = 0) => {
      const counts = new Map();
      return order.map((piece) => {
        const key = duplicateKey(piece);
        const index = counts.get(key) || 0;
        counts.set(key, index + 1);
        return {
          ...piece,
          nestingRotationBias: (index + offset) % 2 === 1 ? 180 : 0,
        };
      });
    };
    const areaDesc = byMetric((item) => item.area);
    const heightDesc = byMetric((item) => item.height);
    const widthDesc = byMetric((item) => item.width);
    const perimeterDesc = byMetric((item) => item.perimeter);
    const regularOrders = [
      areaDesc,
      heightDesc,
      widthDesc,
      perimeterDesc,
      byMetric((item) => item.fill),
      byMetric((item) => item.fill, "asc"),
      byMetric((item) => item.ratio),
      byMetric((item) => item.ratio, "asc"),
      interleaveOrders(widthDesc, heightDesc),
      interleaveOrders(heightDesc, widthDesc),
      [...areaDesc].reverse(),
      withRotationBias(areaDesc, (_piece, index) => index % 2 === 1),
      withRotationBias(areaDesc, (_piece, index) => index % 2 === 0),
      withRotationBias(widthDesc, (_piece, index) => index % 2 === 1),
      withRotationBias(widthDesc, (_piece, index) => index % 2 === 0),
      withRotationBias(heightDesc, (_piece, index) => index % 2 === 1),
      withRotationBias(heightDesc, (_piece, index) => index % 2 === 0),
      withDuplicateRotationBias(areaDesc),
      withDuplicateRotationBias(areaDesc, 1),
      withDuplicateRotationBias(widthDesc),
      withDuplicateRotationBias(widthDesc, 1),
    ];
    let best = null;
    let attempts = 0;
    let lastYield = startTime;
    const clonePiece = (piece) => ({ ...piece, points: piece.points.map((point) => [...point]) });
    const sizeKey = (piece) => String(piece.size || "Sem tamanho").trim() || "Sem tamanho";
    const sizeGroups = [...new Set(unlocked.map(sizeKey))].map((size) => ({
      size,
      foldPieces: foldPieces.filter((piece) => sizeKey(piece) === size),
      regularPieces: regularPieces.filter((piece) => sizeKey(piece) === size),
    }));
    const runOrder = (order, label) => {
      if (ui.separateNestingsBySize.checked) {
        const orderIds = new Set(order.map((piece) => piece.id));
        const groups = sizeGroups.map((group) => ({
          ...group,
          regularPieces: order.filter((piece) => orderIds.has(piece.id) && sizeKey(piece) === group.size),
        })).filter((group) => group.foldPieces.length || group.regularPieces.length);
        const result = runSeparatedNestingPass(groups, lockedPieces, fabricWidth, spacing);
        attempts += 1;
        if (!best || result.score < best.score) {
          best = result;
          nestingPreview = {
            label: `${label} — ${groups.map((group) => group.size).join(" + ")}`,
            pieces: previewPiecesFromResult(result),
            stats: result.stats,
            missingCount: result.missingCount,
          };
        }
        return result;
      }
      const clonedLocked = lockedPieces.map(clonePiece);
      const clonedFold = foldPieces.map(clonePiece);
      const clonedRegular = order.map(clonePiece);
      const result = runNestingPass(clonedLocked, clonedFold, clonedRegular, fabricWidth, spacing);
      attempts += 1;
      if (!best || result.score < best.score) {
        best = result;
        nestingPreview = {
          label,
          pieces: previewPiecesFromResult(result),
          stats: result.stats,
          missingCount: result.missingCount,
        };
      }
      return result;
    };
    const shuffledOrder = (list) => {
      const shuffled = [...list];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      return shuffled;
    };
    const mixedOrder = () => {
      const base = Math.random() > 0.5 ? areaDesc : widthDesc;
      const offset = Math.random() > 0.5 ? 1 : 0;
      return withDuplicateRotationBias(shuffledOrder(base), offset).map((piece, index) => ({
        ...piece,
        nestingRotationBias: piece.nestingRotationBias === 180 || Math.random() > 0.72 || index % 3 === 1 ? 180 : 0,
      })).sort((a, b) => {
        const noise = (Math.random() - 0.5) * Math.max(metric(a).area, metric(b).area) * 0.35;
        return metric(b).area + noise - metric(a).area;
      });
    };
    const yieldIfNeeded = async () => {
      const now = performance.now();
      if (now - lastYield < 120) return;
      updateNestingProgress();
      updateNestingProgressBar(startTime, deadline);
      lastYield = now;
      draw();
      await waitForNextFrame();
    };

    for (const [index, order] of regularOrders.entries()) {
      if (nestingCancelRequested) break;
      if (performance.now() > deadline) break;
      const label = `Estrategia ${index + 1}`;
      runOrder(order, label);
      await yieldIfNeeded();
    }
    while (!nestingCancelRequested && regularPieces.length > 1 && performance.now() < deadline) {
      const order = mixedOrder();
      const label = `Mista ${attempts + 1}`;
      runOrder(order, label);
      await yieldIfNeeded();
    }

    if (!best?.placedCount) {
      updateImportStatus("Nenhuma peca coube na largura atual do tecido.");
      return;
    }

    recordHistory();
    pieces.forEach((piece) => {
      const placement = best.placements.get(piece.id);
      if (!placement) return;
      piece.rotation = placement.rotation;
      piece.x = placement.x;
      piece.y = placement.y;
    });

    const stats = best.stats;
    lastNestingStats = stats;
    lastNestingPlacedIds = [...best.placements.keys()];
    const elapsedSeconds = Math.max(0.01, (performance.now() - startTime) / 1000);
    const missingPieces = unlocked.filter((piece) => !best.placements.has(piece.id));
    if (missingPieces.length) selectedId = missingPieces[0].id;
    draw();
    const missingText = missingPieces.length
      ? `, ${missingPieces.length} peca(s) fora: ${summarizePieceLabels(missingPieces)}`
      : "";
    const resultLabel = nestingCancelRequested ? "Encaixe interrompido, melhor parcial" : "Encaixe automatico";
    const finalMessage = `${resultLabel}: ${attempts} tentativa(s) em ${elapsedSeconds.toFixed(1)}s, comprimento ${stats.usedLength.toFixed(1)} cm, aproveitamento ${stats.efficiency.toFixed(1)}%${missingText}.`;
    updateImportStatus(finalMessage);
    updateNestingProgress(finalMessage);
    ui.nestingProgressBar.value = nestingCancelRequested ? ui.nestingProgressBar.value : 100;
    ui.nestingProgressBar.title = nestingCancelRequested ? ui.nestingProgressBar.title : "Encaixe 100%";
    ui.nestingProgressBar.setAttribute("aria-valuetext", nestingCancelRequested ? ui.nestingProgressBar.getAttribute("aria-valuetext") || "" : "100%");
  } finally {
    ui.autoNest.disabled = false;
    ui.cancelNest.disabled = true;
    setNestingInputsLocked(false);
    setCancelNestActive(false);
    ui.autoNest.removeAttribute("aria-busy");
    if (autoNestLabel) autoNestLabel.textContent = originalLabel;
    nestingRunning = false;
    nestingCancelRequested = false;
    nestingPreview = null;
    setTimeout(() => {
      if (!nestingRunning) {
        ui.nestingProgressBar.value = 0;
        ui.nestingProgressBar.hidden = true;
        ui.nestingProgressBar.title = "";
        ui.nestingProgressBar.removeAttribute("aria-valuetext");
      }
    }, 900);
    draw();
  }
}

function exportSvgMarkup() {
  const fabricWidth = Number(ui.fabricWidth.value);
  const length = markerLength();
  const stats = currentMarkerStats();
  const headerRows = markerHeaderData(stats);
  const markerPieces = currentMarkerPieces();
  const headerY = fabricWidth + 6;
  const headerWidth = Math.max(120, length);
  const rowHeight = 5;
  const labelColumnWidth = 30;
  const svgHeight = headerY + headerRows.length * rowHeight + 4;
  const paths = markerPieces
    .map((piece) => {
      const points = transformedPoints(piece);
      const pieceColor = safePieceColor(piece.color);
      const d = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
      const seamPoints = seamAllowancePoints(piece, points);
      const seam =
        seamPoints.length > 0
          ? `<path d="${seamPoints.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")} Z" fill="none" stroke="#7c3aed" stroke-width="0.35" stroke-dasharray="1.4 1.1"/>`
          : "";
      const notches = notchSegments(piece, points)
        .map(
          ({ start, end }) =>
            `<line x1="${start[0].toFixed(2)}" y1="${start[1].toFixed(2)}" x2="${end[0].toFixed(2)}" y2="${end[1].toFixed(2)}" stroke="#be123c" stroke-width="0.45"/>`,
        )
        .join("");
      return `<g><path d="${d} Z" fill="${pieceColor}22" stroke="${pieceColor}" stroke-width="0.6"><title>${escapeHtml(pieceDisplayLabel(piece))}</title></path>${seam}${notches}</g>`;
    })
    .join("\n  ");
  const header = headerRows
    .map(([label, value], index) => {
      const y = headerY + index * rowHeight;
      return `<rect x="0" y="${y}" width="${headerWidth}" height="${rowHeight}" fill="${index % 2 === 0 ? "#f8faf7" : "#ffffff"}" stroke="#6b7280" stroke-width="0.25"/>
  <text x="1.5" y="${(y + 3.4).toFixed(2)}" font-family="Arial" font-size="2.8" font-weight="700" fill="#4b5563">${escapeHtml(label)}</text>
  <text x="${labelColumnWidth}" y="${(y + 3.4).toFixed(2)}" font-family="Arial" font-size="2.8" font-weight="700" fill="#111827">${escapeHtml(value)}</text>`;
    })
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${length}cm" height="${svgHeight}cm" viewBox="0 0 ${length} ${svgHeight}">
  <rect x="0" y="0" width="${length}" height="${fabricWidth}" fill="#f9faf7" stroke="#6b7280" stroke-width="0.5"/>
  <line x1="${stats.usedLength.toFixed(2)}" y1="0" x2="${stats.usedLength.toFixed(2)}" y2="${fabricWidth}" stroke="#111827" stroke-width="0.45" stroke-dasharray="1.8 1.2"/>
  <text x="${Math.max(0, stats.usedLength - 1).toFixed(2)}" y="4" text-anchor="end" font-family="Arial" font-size="4" font-weight="700" fill="#111827">FIM ${stats.usedLength.toFixed(1)} cm</text>
  ${paths}
  ${header}
</svg>`;
}

function exportSvg() {
  const issues = markerIssueInfo();
  const issueText = markerIssueMessage(issues);
  if (issues.hasIssues) updateImportStatus(`Aviso: exportando SVG com ${issueText}.`);
  const filename = safeProjectFilename("svg");
  downloadFile(exportSvgMarkup(), filename, "image/svg+xml");
  updateImportStatus(`${issues.hasIssues ? "SVG exportado com aviso" : "SVG exportado"}: ${filename}`);
}

function dxfPair(code, value) {
  return `${code}\n${value}`;
}

function dxfPolyline(points, layer, closed = true) {
  const lines = [
    dxfPair(0, "LWPOLYLINE"),
    dxfPair(8, layer),
    dxfPair(90, points.length),
    dxfPair(70, closed ? 1 : 0),
  ];
  points.forEach(([x, y]) => {
    lines.push(dxfPair(10, x.toFixed(3)));
    lines.push(dxfPair(20, y.toFixed(3)));
  });
  return lines;
}

function dxfText(text, point, height, layer) {
  return [
    dxfPair(0, "TEXT"),
    dxfPair(8, layer),
    dxfPair(10, point[0].toFixed(3)),
    dxfPair(20, point[1].toFixed(3)),
    dxfPair(40, height.toFixed(3)),
    dxfPair(1, String(text).replace(/[\r\n]/g, " ")),
  ];
}

function exportDxfMarkup() {
  const stats = currentMarkerStats();
  const markerPieces = currentMarkerPieces();
  const fabricWidth = Number(ui.fabricWidth.value);
  const headerRows = markerHeaderData(stats);
  const headerY = fabricWidth + 6;
  const headerWidth = Math.max(120, markerLength());
  const rowHeight = 2.8;
  const labelColumnWidth = 28;
  const lines = [
    dxfPair(0, "SECTION"),
    dxfPair(2, "HEADER"),
    dxfPair(9, "$INSUNITS"),
    dxfPair(70, 5),
    dxfPair(0, "ENDSEC"),
    dxfPair(0, "SECTION"),
    dxfPair(2, "ENTITIES"),
  ];

  markerPieces.forEach((piece) => {
    const points = transformedPoints(piece);
    if (points.length < 3) return;
    lines.push(...dxfPolyline(points, "MOLDE_CONTORNO", true));
    const seamPoints = seamAllowancePoints(piece, points);
    if (seamPoints.length) lines.push(...dxfPolyline(seamPoints, "MOLDE_MARGEM_COSTURA", true));
    lines.push(...dxfPolyline(pieceGrainlinePoints(piece, points), "MOLDE_FIO", false));
    notchSegments(piece, points).forEach(({ start, end }) => {
      lines.push(...dxfPolyline([start, end], "MOLDE_PIQUE", false));
    });
  });

  lines.push(...dxfPolyline([[stats.usedLength, 0], [stats.usedLength, fabricWidth]], "MOLDE_FIM_ENCAIXE", false));
  lines.push(...dxfText(`FIM ${stats.usedLength.toFixed(1)} cm`, [Math.max(0, stats.usedLength - 22), 4], 2.5, "MOLDE_FIM_ENCAIXE"));

  const headerBottom = headerY + headerRows.length * rowHeight;
  lines.push(
    ...dxfPolyline(
      [
        [0, headerY],
        [headerWidth, headerY],
        [headerWidth, headerBottom],
        [0, headerBottom],
      ],
      "MOLDE_CABECARIO",
      true,
    ),
  );
  lines.push(...dxfPolyline([[labelColumnWidth - 1, headerY], [labelColumnWidth - 1, headerBottom]], "MOLDE_CABECARIO", false));
  headerRows.forEach(([label, value], index) => {
    const y = headerY + index * rowHeight;
    lines.push(...dxfPolyline([[0, y], [headerWidth, y]], "MOLDE_CABECARIO", false));
    lines.push(...dxfText(label, [1.2, y + 1.9], 1.4, "MOLDE_CABECARIO"));
    lines.push(...dxfText(value, [labelColumnWidth, y + 1.9], 1.4, "MOLDE_CABECARIO"));
  });

  lines.push(dxfPair(0, "ENDSEC"));
  lines.push(dxfPair(0, "EOF"));
  return `${lines.join("\n")}\n`;
}

function exportDxf() {
  const issues = markerIssueInfo();
  const issueText = markerIssueMessage(issues);
  if (issues.hasIssues) updateImportStatus(`Aviso: exportando DXF com ${issueText}.`);
  const filename = safeProjectFilename("dxf");
  downloadFile(exportDxfMarkup(), filename, "application/dxf");
  updateImportStatus(`${issues.hasIssues ? "DXF exportado com aviso" : "DXF exportado"}: ${filename}`);
}

function hpglPoint([x, y]) {
  const unitsPerCm = 400;
  return [Math.round(x * unitsPerCm), Math.round(y * unitsPerCm)];
}

function hpglLabel(text) {
  return String(text).replace(/[;\x03\r\n]/g, " ");
}

function pieceGrainlinePoints(piece, points) {
  const box = bounds(points);
  const centerX = (box.minX + box.maxX) / 2;
  const centerY = (box.minY + box.maxY) / 2;
  const length = Math.max(12, Math.min(box.maxX - box.minX, box.maxY - box.minY) * 0.55);
  const angle = (((piece.grainAngle || 0) % 360) * Math.PI) / 180;
  const dx = Math.sin(angle) * length * 0.5;
  const dy = Math.cos(angle) * length * 0.5;
  return [
    [centerX - dx, centerY - dy],
    [centerX + dx, centerY + dy],
  ];
}

function exportPltMarkup() {
  const commands = ["IN;", "SP1;", "VS20;"];
  const stats = currentMarkerStats();
  const markerPieces = currentMarkerPieces();
  const fabricWidth = Number(ui.fabricWidth.value);

  markerPieces.forEach((piece) => {
    const points = transformedPoints(piece);
    if (points.length < 2) return;
    const [startX, startY] = hpglPoint(points[0]);
    commands.push(`PU${startX},${startY};`);
    commands.push(`PD${points.map((point) => hpglPoint(point).join(",")).join(",")},${startX},${startY};`);
    commands.push("PU;");

    const seamPoints = seamAllowancePoints(piece, points);
    if (seamPoints.length) {
      const [seamStartX, seamStartY] = hpglPoint(seamPoints[0]);
      commands.push(`PU${seamStartX},${seamStartY};`);
      commands.push(`PD${seamPoints.map((point) => hpglPoint(point).join(",")).join(",")},${seamStartX},${seamStartY};`);
      commands.push("PU;");
    }

    const grainline = pieceGrainlinePoints(piece, points).map(hpglPoint);
    commands.push(`PU${grainline[0][0]},${grainline[0][1]};`);
    commands.push(`PD${grainline[1][0]},${grainline[1][1]};`);
    commands.push("PU;");

    notchSegments(piece, points).forEach(({ start, end }) => {
      const notchStart = hpglPoint(start);
      const notchEnd = hpglPoint(end);
      commands.push(`PU${notchStart[0]},${notchStart[1]};`);
      commands.push(`PD${notchEnd[0]},${notchEnd[1]};`);
      commands.push("PU;");
    });
  });

  const [endLineX, endLineTop] = hpglPoint([stats.usedLength, 0]);
  const [, endLineBottom] = hpglPoint([stats.usedLength, fabricWidth]);
  commands.push(`PU${endLineX},${endLineTop};`);
  commands.push(`PD${endLineX},${endLineBottom};`);
  commands.push("PU;");

  const headerRows = markerHeaderData(stats);
  const headerX = 0;
  const headerY = fabricWidth + 6;
  const headerWidth = Math.max(120, stats.usedLength);
  const rowHeight = 2.8;
  const labelColumnWidth = 28;
  const headerPoints = [
    [headerX, headerY],
    [headerX + headerWidth, headerY],
    [headerX + headerWidth, headerY + headerRows.length * rowHeight],
    [headerX, headerY + headerRows.length * rowHeight],
  ];
  const [headerStartX, headerStartY] = hpglPoint(headerPoints[0]);
  commands.push(`PU${headerStartX},${headerStartY};`);
  commands.push(`PD${headerPoints.map((point) => hpglPoint(point).join(",")).join(",")},${headerStartX},${headerStartY};`);
  commands.push("PU;");
  commands.push("SI0.25,0.35;");

  headerRows.forEach(([label, value], index) => {
    const y = headerY + index * rowHeight;
    const [lineStartX, lineStartY] = hpglPoint([headerX, y]);
    const [lineEndX, lineEndY] = hpglPoint([headerX + headerWidth, y]);
    commands.push(`PU${lineStartX},${lineStartY};`);
    commands.push(`PD${lineEndX},${lineEndY};`);
    commands.push("PU;");
    const [labelX, labelY] = hpglPoint([headerX + 1.2, y + 1.9]);
    const [valueX, valueY] = hpglPoint([headerX + labelColumnWidth, y + 1.9]);
    commands.push(`PU${labelX},${labelY};LB${hpglLabel(label)}\x03`);
    commands.push(`PU${valueX},${valueY};LB${hpglLabel(value)}\x03`);
  });
  const [columnX, columnTopY] = hpglPoint([headerX + labelColumnWidth - 1, headerY]);
  const [, columnBottomY] = hpglPoint([headerX + labelColumnWidth - 1, headerY + headerRows.length * rowHeight]);
  commands.push(`PU${columnX},${columnTopY};`);
  commands.push(`PD${columnX},${columnBottomY};`);
  commands.push("PU;");

  commands.push("SP0;");
  return commands.join("\n");
}

function safeProjectFilename(extension) {
  const safeName = (ui.projectName.value || "MoldeLab Projeto")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "moldelab-projeto";
  return `${safeName}.${extension}`;
}

function exportPlt() {
  const issues = markerIssueInfo();
  const issueText = markerIssueMessage(issues);
  if (issues.hasIssues) updateImportStatus(`Aviso: exportando PLT com ${issueText}.`);
  const filename = safeProjectFilename("plt");
  downloadFile(exportPltMarkup(), filename, "application/vnd.hp-hpgl");
  updateImportStatus(`${issues.hasIssues ? "PLT exportado com aviso" : "PLT exportado para plotter"}: ${filename}`);
}

function exportMiniMarker() {
  const issues = markerIssueInfo();
  const fabricWidth = Number(ui.fabricWidth.value);
  const stats = currentMarkerStats();
  const markerPieces = currentMarkerPieces();
  const length = Math.max(markerLength(), stats.usedLength);
  const previewWidth = 1600;
  const margin = 48;
  const headerRows = markerHeaderData(stats);
  const titleHeight = 54;
  const tableRowHeight = 34;
  const headerHeight = titleHeight + headerRows.length * tableRowHeight + 30;
  const previewScale = (previewWidth - margin * 2) / length;
  const previewHeight = Math.ceil(headerHeight + fabricWidth * previewScale + margin);
  const output = document.createElement("canvas");
  output.width = previewWidth;
  output.height = previewHeight;
  const out = output.getContext("2d");

  out.fillStyle = "#ffffff";
  out.fillRect(0, 0, output.width, output.height);

  out.fillStyle = "#111827";
  out.font = "700 28px Arial";
  out.fillText(ui.projectName.value || "MoldeLab Projeto", margin, 38);

  const tableX = margin;
  const tableY = titleHeight;
  const tableWidth = previewWidth - margin * 2;
  const labelWidth = 260;
  out.strokeStyle = "#6b7280";
  out.lineWidth = 2;
  out.strokeRect(tableX, tableY, tableWidth, headerRows.length * tableRowHeight);
  headerRows.forEach(([label, value], index) => {
    const y = tableY + index * tableRowHeight;
    out.fillStyle = index % 2 === 0 ? "#f8faf7" : "#ffffff";
    out.fillRect(tableX, y, tableWidth, tableRowHeight);
    out.strokeStyle = "#d1d5db";
    out.lineWidth = 1;
    out.beginPath();
    out.moveTo(tableX, y);
    out.lineTo(tableX + tableWidth, y);
    out.moveTo(tableX + labelWidth, y);
    out.lineTo(tableX + labelWidth, y + tableRowHeight);
    out.stroke();
    out.fillStyle = "#4b5563";
    out.font = "700 16px Arial";
    out.fillText(label, tableX + 14, y + 22);
    out.fillStyle = "#111827";
    out.font = "700 17px Arial";
    out.fillText(value, tableX + labelWidth + 14, y + 22);
  });
  out.strokeStyle = "#6b7280";
  out.lineWidth = 2;
  out.strokeRect(tableX, tableY, tableWidth, headerRows.length * tableRowHeight);

  const ox = margin;
  const oy = headerHeight;
  const fw = length * previewScale;
  const fh = fabricWidth * previewScale;

  out.fillStyle = "#f9faf7";
  out.strokeStyle = "#6b7280";
  out.lineWidth = 2;
  out.fillRect(ox, oy, fw, fh);
  out.strokeRect(ox, oy, fw, fh);

  out.strokeStyle = "#d8e0db";
  out.lineWidth = 1;
  for (let cm = 10; cm < length; cm += 10) {
    out.beginPath();
    out.moveTo(ox + cm * previewScale, oy);
    out.lineTo(ox + cm * previewScale, oy + fh);
    out.stroke();
  }
  for (let cm = 10; cm < fabricWidth; cm += 10) {
    out.beginPath();
    out.moveTo(ox, oy + cm * previewScale);
    out.lineTo(ox + fw, oy + cm * previewScale);
    out.stroke();
  }

  markerPieces.forEach((piece) => {
    const points = transformedPoints(piece);
    const pieceColor = safePieceColor(piece.color);
    out.beginPath();
    points.forEach(([x, y], index) => {
      const px = ox + x * previewScale;
      const py = oy + y * previewScale;
      if (index === 0) out.moveTo(px, py);
      else out.lineTo(px, py);
    });
    out.closePath();
    out.fillStyle = `${pieceColor}22`;
    out.strokeStyle = pieceColor;
    out.lineWidth = 3;
    out.fill();
    out.stroke();

    const seamPoints = seamAllowancePoints(piece, points);
    if (seamPoints.length) {
      out.save();
      out.setLineDash([10, 7]);
      out.strokeStyle = "#7c3aed";
      out.lineWidth = 2;
      out.beginPath();
      seamPoints.forEach(([x, y], index) => {
        const px = ox + x * previewScale;
        const py = oy + y * previewScale;
        if (index === 0) out.moveTo(px, py);
        else out.lineTo(px, py);
      });
      out.closePath();
      out.stroke();
      out.restore();
    }

    out.strokeStyle = "#be123c";
    out.lineWidth = 2;
    notchSegments(piece, points).forEach(({ start, end }) => {
      out.beginPath();
      out.moveTo(ox + start[0] * previewScale, oy + start[1] * previewScale);
      out.lineTo(ox + end[0] * previewScale, oy + end[1] * previewScale);
      out.stroke();
    });

    const box = bounds(points);
    out.fillStyle = "#111827";
    out.font = "700 16px Arial";
    out.fillText(pieceDisplayLabel(piece), ox + (box.minX + 1.5) * previewScale, oy + (box.minY + 5) * previewScale);
  });

  const endX = ox + stats.usedLength * previewScale;
  out.save();
  out.strokeStyle = "#111827";
  out.lineWidth = 4;
  out.setLineDash([14, 9]);
  out.beginPath();
  out.moveTo(endX, oy);
  out.lineTo(endX, oy + fh);
  out.stroke();
  out.setLineDash([]);
  out.fillStyle = "#111827";
  out.font = "700 18px Arial";
  out.textAlign = "right";
  out.fillText(`FIM ${stats.usedLength.toFixed(1)} cm`, endX - 8, oy + 24);
  out.restore();

  output.toBlob((blob) => {
    if (!blob) {
      updateImportStatus("Nao foi possivel gerar o mini risco.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = safeProjectFilename("jpg");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    updateImportStatus(`${issues.hasIssues ? "Mini risco JPG exportado com aviso" : "Mini risco JPG exportado"}: ${filename}`);
  }, "image/jpeg", 0.92);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function projectSnapshot() {
  return {
    version: 1,
    app: "MoldeLab",
    projectName: ui.projectName.value || "MoldeLab Projeto",
    fabric: {
      type: ui.fabricType.value,
      width: Number(ui.fabricWidth.value),
      spacing: Number(ui.spacing.value),
      nestingTimer: Math.max(1, Math.min(60, Number(ui.nestingTimer.value) || 3)),
      length: markerLength(),
    },
    editor: {
      snapToGrid: ui.snapToGrid.checked,
      showGrid: ui.showGrid.checked,
      gridStep: Math.max(0.1, Number(ui.gridStep.value) || 1),
      showMarkerHeader: !ui.markerHeader.hidden,
      nestingStats: lastNestingStats,
      nestingPlacedIds: lastNestingPlacedIds,
    },
    counters: {
      newPieceCount,
      digitizedCount,
      importedCount,
    },
    selectedId,
    pieces: pieces.map((piece) => ({
      id: piece.id,
      name: piece.name,
      model: piece.model || "",
      size: piece.size || "",
      x: piece.x,
      y: piece.y,
      rotation: piece.rotation,
      grainAngle: piece.grainAngle || 0,
      seamAllowance: Number(piece.seamAllowance) || 0,
      gradeBaseId: piece.gradeBaseId || "",
      mirrored: Boolean(piece.mirrored),
      locked: Boolean(piece.locked),
      color: piece.color,
      points: piece.points.map(([x, y]) => [x, y]),
      notches: [...(piece.notches || [])],
    })),
  };
}

function saveProject() {
  const snapshot = projectSnapshot();
  const safeName = snapshot.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "moldelab-projeto";
  downloadFile(JSON.stringify(snapshot, null, 2), `${safeName}.moldelab.json`, "application/json");
  // Mark active tab as saved
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab) {
    tab.snapshot = cloneSnapshot(snapshot);
    tab.savedSnapshot = cloneSnapshot(snapshot);
    renderTabs();
  }
}

function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

function restoreSnapshot(snapshot) {
  historySuspended = true;
  const data = cloneSnapshot(snapshot);
  lastNestingStats = null;
  lastNestingPlacedIds = null;
  ui.projectName.value = data.projectName || "MoldeLab Projeto";
  ui.fabricType.value = data.fabric?.type || "flat";
  ui.fabricWidth.value = data.fabric?.width || 150;
  ui.spacing.value = data.fabric?.spacing ?? 0;
  ui.nestingTimer.value = data.fabric?.nestingTimer ?? 3;
  ui.snapToGrid.checked = Boolean(data.editor?.snapToGrid);
  ui.showGrid.checked = data.editor?.showGrid ?? true;
  ui.gridStep.value = data.editor?.gridStep || 1;
  restoreMarkerHeaderPreference(data.editor);

  pieces.splice(
    0,
    pieces.length,
    ...data.pieces.map((piece, index) => ({
      id: piece.id || `restored-${index + 1}`,
      name: piece.name || `Peca ${index + 1}`,
      model: piece.model || "",
      size: piece.size || "",
      x: Number(piece.x) || 0,
      y: Number(piece.y) || 0,
      rotation: Number(piece.rotation) || 0,
      grainAngle: Number(piece.grainAngle) || 0,
      seamAllowance: Number(piece.seamAllowance) || 0,
      gradeBaseId: piece.gradeBaseId || "",
      mirrored: Boolean(piece.mirrored),
      locked: Boolean(piece.locked),
      color: piece.color || "#475569",
      points: Array.isArray(piece.points) ? piece.points.map(([x, y]) => [Number(x) || 0, Number(y) || 0]) : [],
      notches: Array.isArray(piece.notches) ? piece.notches.map(Number).filter(Number.isInteger) : [],
    })).filter((piece) => piece.points.length >= 3)
      .map((piece) => ({
        ...piece,
        notches: piece.notches.filter((pointIndex) => pointIndex >= 0 && pointIndex < piece.points.length),
      })),
  );

  newPieceCount = data.counters?.newPieceCount || 1;
  digitizedCount = data.counters?.digitizedCount || 1;
  importedCount = data.counters?.importedCount || 1;
  selectedId = pieces.some((piece) => piece.id === data.selectedId) ? data.selectedId : pieces[0]?.id || null;
  lastNestingStats = validNestingStats(data.editor?.nestingStats);
  lastNestingPlacedIds = lastNestingStats ? validPlacedIds(data.editor?.nestingPlacedIds) : null;
  if (!lastNestingPlacedIds) lastNestingStats = null;
  selectedPointIndex = null;
  contourPoints = [];
  calibrationPoints = [];
  measurePoints = [];
  historySuspended = false;
}

function recordHistory() {
  if (historySuspended) return;
  undoStack.push(cloneSnapshot(projectSnapshot()));
  lastNestingStats = null;
  lastNestingPlacedIds = null;
  if (undoStack.length > 80) undoStack.shift();
  redoStack = [];
  // Update active tab snapshot so dirty indicator reflects latest state
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab) { tab.snapshot = cloneSnapshot(projectSnapshot()); renderTabs(); }
}

function undoAction() {
  if (!undoStack.length) return;
  redoStack.push(cloneSnapshot(projectSnapshot()));
  restoreSnapshot(undoStack.pop());
  updateImportStatus("Alteracao desfeita.");
  draw();
}

function redoAction() {
  if (!redoStack.length) return;
  undoStack.push(cloneSnapshot(projectSnapshot()));
  restoreSnapshot(redoStack.pop());
  updateImportStatus("Alteracao refeita.");
  draw();
}

function openProject(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (data.app !== "MoldeLab" || !Array.isArray(data.pieces)) {
        updateImportStatus("Arquivo de projeto invalido.");
        return;
      }
      // Build a full snapshot from file data (reuse restoreSnapshot logic via temp)
      const snap = {
        version: data.version || 1,
        app: "MoldeLab",
        projectName: data.projectName || "MoldeLab Projeto",
        fabric: data.fabric || {},
        editor: data.editor || {},
        counters: data.counters || {},
        selectedId: data.selectedId || null,
        pieces: data.pieces,
      };
      openInNewTab(snap, cloneSnapshot(snap), file.name);
      updateImportStatus(`Projeto aberto: ${snap.projectName}`);
    } catch (error) {
      updateImportStatus("Nao foi possivel abrir o projeto.");
    }
  };
  reader.readAsText(file);
}

function setZoom(nextZoom, anchor = [canvas.width / 2, canvas.height / 2]) {
  const before = screenToWorld(anchor[0], anchor[1]);
  view.zoom = Math.min(10, Math.max(0.55, nextZoom));
  const after = worldToScreen(before);
  view.panX += anchor[0] - after[0];
  view.panY += anchor[1] - after[1];
  draw();
}

function setZoomPercent(percent) {
  setZoom(percent / 100);
  updateImportStatus(`Zoom ajustado para ${percent}%.`);
}

function fitViewToPieces() {
  const allPoints = pieces.flatMap(transformedPoints);
  if (!allPoints.length) return;
  const box = bounds(allPoints);
  const width = Math.max(1, box.maxX - box.minX);
  const height = Math.max(1, box.maxY - box.minY);
  const padding = 70;
  const zoomX = (canvas.width - padding * 2) / (width * baseScale);
  const zoomY = (canvas.height - padding * 2) / (height * baseScale);
  view.zoom = Math.min(10, Math.max(0.25, Math.min(zoomX, zoomY)));
  view.panX = canvas.width / 2 - origin.x - ((box.minX + width / 2) * baseScale * view.zoom);
  view.panY = canvas.height / 2 - origin.y - ((box.minY + height / 2) * baseScale * view.zoom);
  updateImportStatus("Pecas ajustadas a tela.");
  draw();
}

function addPiece() {
  recordHistory();
  const id = `custom-${newPieceCount}`;
  pieces.push({
    id,
    name: `Nova peca ${newPieceCount}`,
    model: "",
    size: "",
    x: 18 + newPieceCount * 6,
    y: 18 + newPieceCount * 6,
    rotation: 0,
    grainAngle: 0,
    seamAllowance: 0,
    mirrored: false,
    locked: false,
    color: "#0891b2",
    notches: [],
    points: [
      [0, 0],
      [34, 0],
      [40, 24],
      [22, 38],
      [0, 28],
    ],
  });
  newPieceCount += 1;
  selectedId = id;
  mode = "points";
  draw();
}

function duplicateSelectedPiece() {
  const source = selectedPiece();
  if (!source) return;
  pastePieceFromSource(source, `${source.name} copia`, 8);
}

function copySelectedPiece() {
  const piece = selectedPiece();
  if (!piece) return;
  pieceClipboard = cloneSnapshot(piece);
  updateClipboardButtons();
  updateImportStatus(`Peca copiada: ${piece.name}.`);
}

function pasteCopiedPiece() {
  if (!pieceClipboard) {
    updateImportStatus("Nenhuma peca copiada.");
    return;
  }
  pastePieceFromSource(pieceClipboard, `${pieceClipboard.name || "Peca"} colada`, 12);
}

function pastePieceFromSource(source, name, offset) {
  recordHistory();
  const id = `copy-${Date.now()}`;
  const copy = {
    ...source,
    id,
    name,
    x: source.x + offset,
    y: source.y + offset,
    locked: false,
    points: source.points.map(([x, y]) => [x, y]),
    notches: [...(source.notches || [])],
  };
  pieces.push(copy);
  selectedId = id;
  mode = "points";
  updateImportStatus(`Peca criada: ${copy.name}`);
  draw();
}

function renameSelectedPiece() {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de renomear.");
    return;
  }
  const nextName = ui.pieceName.value.trim();
  if (!nextName) return;
  if (piece.name === nextName) return;
  recordHistory();
  piece.name = nextName;
  draw();
}

function updateSelectedPieceMeta(field, input) {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de alterar modelo ou tamanho.");
    input.value = piece[field] || "";
    return;
  }
  const nextValue = input.value.trim();
  if ((piece[field] || "") === nextValue) return;
  recordHistory();
  piece[field] = nextValue;
  draw();
}

function updateSelectedSeamAllowance() {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de alterar a margem.");
    ui.seamAllowance.value = Number(piece.seamAllowance || 0).toFixed(1);
    return;
  }
  const nextAllowance = Math.max(0, Number(ui.seamAllowance.value) || 0);
  if (piece.seamAllowance === nextAllowance) return;
  recordHistory();
  piece.seamAllowance = nextAllowance;
  draw();
}

function updateSelectedPieceColor() {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de alterar a cor.");
    ui.pieceColor.value = safePieceColor(piece.color);
    return;
  }
  const nextColor = safePieceColor(ui.pieceColor.value);
  if (piece.color === nextColor) return;
  recordHistory();
  piece.color = nextColor;
  draw();
}

function toggleSelectedPieceLock() {
  const piece = selectedPiece();
  if (!piece) return;
  recordHistory();
  piece.locked = !piece.locked;
  selectedPointIndex = null;
  updateImportStatus(piece.locked ? `Peca bloqueada: ${piece.name}.` : `Peca desbloqueada: ${piece.name}.`);
  draw();
}

function moveSelectedPieceBy(deltaX, deltaY, message) {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de alinhar.");
    return;
  }
  if (!deltaX && !deltaY) {
    updateImportStatus("A peca ja esta nessa posicao.");
    return;
  }
  recordHistory();
  piece.x += deltaX;
  piece.y += deltaY;
  updateImportStatus(message);
  draw();
}

function alignSelectedPiece(modeName) {
  const piece = selectedPiece();
  if (!piece) return;
  const box = bounds(transformedPoints(piece));
  const fabricWidth = Number(ui.fabricWidth.value);

  if (modeName === "origin") {
    moveSelectedPieceBy(-box.minX, -box.minY, `Peca posicionada na origem: ${piece.name}.`);
  }
  if (modeName === "center-width") {
    const center = (box.minY + box.maxY) / 2;
    moveSelectedPieceBy(0, fabricWidth / 2 - center, `Peca centralizada na largura: ${piece.name}.`);
  }
  if (modeName === "left") {
    moveSelectedPieceBy(-box.minX, 0, `Peca encostada na esquerda: ${piece.name}.`);
  }
  if (modeName === "top") {
    moveSelectedPieceBy(0, -box.minY, `Peca encostada no topo: ${piece.name}.`);
  }
}

function nudgeSelectedPiece(event) {
  const directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const direction = directions[event.key];
  if (!direction) return false;
  const target = event.target;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(target?.tagName)) return false;
  const step = event.shiftKey ? 5 : Math.max(0.1, Number(ui.gridStep.value) || 1);
  const piece = selectedPiece();

  if (mode === "points" && piece && selectedPointIndex !== null) {
    if (piece.locked) {
      updateImportStatus("Desbloqueie a peca antes de mover pontos.");
      return true;
    }
    const worldPoint = transformedPoints(piece)[selectedPointIndex];
    if (!worldPoint) return false;
    const movedPoint = [worldPoint[0] + direction[0] * step, worldPoint[1] + direction[1] * step];
    recordHistory();
    piece.points[selectedPointIndex] = inverseTransformedPoint(piece, movedPoint);
    updateImportStatus(`Ponto movido ${step} cm.`);
    draw();
    return true;
  }

  moveSelectedPieceBy(direction[0] * step, direction[1] * step, `Peca movida ${step} cm.`);
  return true;
}

function deleteSelectedPiece() {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de apagar.");
    return;
  }
  const confirmed = window.confirm(`Apagar a peca "${piece.name}"?`);
  if (!confirmed) return;
  const index = pieces.findIndex((item) => item.id === piece.id);
  if (index === -1) return;
  recordHistory();
  pieces.splice(index, 1);
  selectedId = pieces[Math.max(0, index - 1)]?.id || pieces[0]?.id || null;
  updateImportStatus(`Peca apagada: ${piece.name}`);
  draw();
}

function deleteSelectedPoint() {
  const piece = selectedPiece();
  if (!piece || selectedPointIndex === null) {
    updateImportStatus("Selecione um ponto no modo Pontos.");
    return;
  }
  if (piece.points.length <= 3) {
    updateImportStatus("A peca precisa manter pelo menos 3 pontos.");
    return;
  }
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de apagar pontos.");
    return;
  }
  recordHistory();
  piece.points.splice(selectedPointIndex, 1);
  piece.notches = (piece.notches || [])
    .filter((pointIndex) => pointIndex !== selectedPointIndex)
    .map((pointIndex) => (pointIndex > selectedPointIndex ? pointIndex - 1 : pointIndex));
  selectedPointIndex = null;
  updateImportStatus(`Ponto apagado de ${piece.name}.`);
  draw();
}

function gradeSelectedPoint(deltaX, deltaY) {
  const piece = selectedPiece();
  if (!piece || selectedPointIndex === null) {
    mode = "points";
    updateImportStatus("Selecione um ponto no modo Pontos para graduar.");
    draw();
    return;
  }
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de graduar pontos.");
    return;
  }
  const step = Math.max(0.1, Number(ui.gradingStep.value) || 0.5);
  const worldPoint = transformedPoints(piece)[selectedPointIndex];
  if (!worldPoint) return;
  recordHistory();
  const movedPoint = [worldPoint[0] + deltaX * step, worldPoint[1] + deltaY * step];
  piece.points[selectedPointIndex] = inverseTransformedPoint(piece, movedPoint);
  const direction = deltaX < 0 ? "esquerda" : deltaX > 0 ? "direita" : deltaY < 0 ? "cima" : "baixo";
  updateImportStatus(`Graduacao manual: ponto ${selectedPointIndex + 1} movido ${step} cm para ${direction}.`);
  draw();
}

function createGradingCopy() {
  const source = selectedPiece();
  if (!source) {
    updateImportStatus("Selecione uma peca para criar a copia de graduacao.");
    return;
  }
  if (source.locked) {
    updateImportStatus("Desbloqueie a peca antes de criar a copia de graduacao.");
    return;
  }

  const existingIds = new Set(pieces.map((piece) => piece.id));
  const copySize = ui.gradeCopySize.value.trim() || `${source.size || "Grade"}+`;
  const safeSizeId = copySize.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "copia";
  let id = gradeCopyId(source.id, safeSizeId);
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `grade-${source.id}-${safeSizeId}-${suffix}`;
    suffix += 1;
  }

  const requestedColor = safePieceColor(ui.gradeCopyColor.value || nextGradingColor(source.color));
  const copyColor = requestedColor.toLowerCase() === safePieceColor(source.color).toLowerCase()
    ? nextGradingColor(source.color)
    : requestedColor;
  recordHistory();
  pieces.push({
    ...source,
    id,
    name: `${source.name} ${copySize}`,
    size: copySize,
    gradeBaseId: source.id,
    color: copyColor,
    locked: false,
    points: source.points.map(([x, y]) => [x, y]),
    notches: [...(source.notches || [])],
  });

  selectedId = id;
  selectedPointIndex = null;
  mode = "points";
  ui.gradeCopyColor.value = nextGradingColor(copyColor);
  updateImportStatus(`Copia de graduacao criada sobre ${source.name}. Selecione os pontos e estique com as setas.`);
  draw();
}

function gradeTableRows() {
  const sizes = [...document.querySelectorAll(".grade-table-size")];
  const dxValues = [...document.querySelectorAll(".grade-table-dx")];
  const dyValues = [...document.querySelectorAll(".grade-table-dy")];
  return sizes.map((input, index) => ({
    size: input.value.trim(),
    dx: Number(dxValues[index]?.value) || 0,
    dy: Number(dyValues[index]?.value) || 0,
  })).filter((row) => row.size);
}

function setActiveGradeRow(rowIndex) {
  activeGradeRowIndex = Math.max(0, Math.min(2, Number(rowIndex) || 0));
  document.querySelectorAll("[data-grade-row]").forEach((input) => {
    input.dataset.gradeActive = input.dataset.gradeRow === String(activeGradeRowIndex) ? "true" : "false";
  });
}

function activeGradeInput(selector) {
  return document.querySelector(`${selector}[data-grade-row="${activeGradeRowIndex}"]`);
}

function updateActiveGradeRow(deltaX, deltaY) {
  const step = Math.max(0.1, Number(ui.gradeIncrement.value) || 1);
  const dxInput = activeGradeInput(".grade-table-dx");
  const dyInput = activeGradeInput(".grade-table-dy");
  if (!dxInput || !dyInput) return;
  const currentDx = Number(dxInput.value) || 0;
  const currentDy = Number(dyInput.value) || 0;
  const nextDx = ui.gradeIncremental.checked ? currentDx + deltaX * step : deltaX * step;
  const nextDy = ui.gradeIncremental.checked ? currentDy + deltaY * step : deltaY * step;
  dxInput.value = String(Number(nextDx.toFixed(2)));
  dyInput.value = String(Number(nextDy.toFixed(2)));
}

function zeroActiveGradeRow() {
  const dxInput = activeGradeInput(".grade-table-dx");
  const dyInput = activeGradeInput(".grade-table-dy");
  if (!dxInput || !dyInput) return;
  dxInput.value = "0";
  dyInput.value = "0";
}

function basePieceForGrading(piece) {
  if (!piece) return null;
  return pieces.find((item) => item.id === piece.gradeBaseId) || piece;
}

function findOrCreateGradePiece(base, row, colorSeed) {
  const id = gradeCopyId(base.id, row.size);
  const existing = pieces.find((piece) => piece.id === id);
  if (existing) return existing;
  const color = nextGradingColor(colorSeed || base.color);
  const copy = {
    ...base,
    id,
    name: `${base.name} ${row.size}`,
    size: row.size,
    gradeBaseId: base.id,
    color,
    locked: false,
    points: base.points.map(([x, y]) => [x, y]),
    notches: [...(base.notches || [])],
  };
  pieces.push(copy);
  return copy;
}

function applyGradeTableToSelectedPoint() {
  const current = selectedPiece();
  const base = basePieceForGrading(current);
  if (!base) {
    updateImportStatus("Selecione uma peca para graduar via tabela.");
    return;
  }
  if (selectedPointIndex === null) {
    mode = "points";
    selectedId = current?.id || base.id;
    updateImportStatus("Selecione um ponto para aplicar a tabela de graduacao.");
    draw();
    return;
  }
  if (!base.points[selectedPointIndex]) {
    updateImportStatus("Este ponto nao existe na peca base.");
    return;
  }

  const rows = gradeTableRows().filter((row) => row.size !== String(base.size || "").trim() && (row.dx !== 0 || row.dy !== 0));
  if (!rows.length) {
    updateImportStatus("Preencha pelo menos uma linha com tamanho e DX/DY diferente de zero.");
    return;
  }

  const baseWorldPoint = transformedPoints(base)[selectedPointIndex];
  let lastUpdatedId = current?.id || base.id;
  let colorSeed = base.color;
  let updated = 0;
  recordHistory();
  rows.forEach((row) => {
    const copy = findOrCreateGradePiece(base, row, colorSeed);
    colorSeed = copy.color;
    if (!copy.points[selectedPointIndex]) return;
    const movedPoint = [baseWorldPoint[0] + row.dx, baseWorldPoint[1] + row.dy];
    copy.points[selectedPointIndex] = inverseTransformedPoint(copy, movedPoint);
    lastUpdatedId = copy.id;
    updated += 1;
  });

  selectedId = lastUpdatedId;
  mode = "points";
  updateImportStatus(`Tabela aplicada no ponto ${selectedPointIndex + 1}: ${updated} tamanho(s) atualizados.`);
  draw();
}

function handleFloatingToolbarAction(action) {
  const actions = {
    move: () => ui.modeMove.click(),
    points: () => ui.modePoints.click(),
    copy: () => ui.copyPiece.click(),
    duplicate: () => ui.duplicatePiece.click(),
    "grade-copy": () => ui.createGradeCopy.click(),
    lock: () => ui.toggleLockPiece.click(),
    "rotate-left": () => ui.rotateLeft.click(),
    "rotate-right": () => ui.rotateRight.click(),
    mirror: () => ui.mirrorPiece.click(),
    "grade-left": () => ui.gradeLeft.click(),
    "grade-right": () => ui.gradeRight.click(),
    "grade-up": () => ui.gradeUp.click(),
    "grade-down": () => ui.gradeDown.click(),
  };
  actions[action]?.();
}

function addNotchToSelectedPoint() {
  const piece = selectedPiece();
  if (!piece || selectedPointIndex === null) {
    updateImportStatus("Selecione um ponto no modo Pontos para adicionar pique.");
    return;
  }
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de adicionar pique.");
    return;
  }
  piece.notches = piece.notches || [];
  if (piece.notches.includes(selectedPointIndex)) {
    updateImportStatus("Este ponto ja tem pique.");
    return;
  }
  recordHistory();
  piece.notches.push(selectedPointIndex);
  updateImportStatus(`Pique adicionado em ${piece.name}.`);
  draw();
}

function deleteNotchFromSelectedPoint() {
  const piece = selectedPiece();
  if (!piece || selectedPointIndex === null) {
    updateImportStatus("Selecione um ponto com pique para apagar.");
    return;
  }
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de apagar pique.");
    return;
  }
  const before = piece.notches?.length || 0;
  if (!piece.notches?.includes(selectedPointIndex)) {
    updateImportStatus("Este ponto nao tem pique.");
    return;
  }
  recordHistory();
  piece.notches = (piece.notches || []).filter((pointIndex) => pointIndex !== selectedPointIndex);
  updateImportStatus(before === piece.notches.length ? "Este ponto nao tem pique." : `Pique apagado de ${piece.name}.`);
  draw();
}

function normalizeImportedPoints(points) {
  const clean = points.filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (clean.length < 3) return null;
  const box = bounds(clean);
  const width = Math.max(1, box.maxX - box.minX);
  const scaleToCm = width > 220 ? 0.1 : 1;
  return {
    x: box.minX * scaleToCm,
    y: box.minY * scaleToCm,
    points: clean.map(([x, y]) => [(x - box.minX) * scaleToCm, (y - box.minY) * scaleToCm]),
  };
}

function parsePointList(value) {
  const numbers = value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) || [];
  const points = [];
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    points.push([numbers[index], numbers[index + 1]]);
  }
  return points;
}

function decodeHpglEncodedValue(data, start, base = 32) {
  let index = start;
  let value = 0;
  let multiplier = 1;
  let terminated = false;
  while (index < data.length) {
    const code = data.charCodeAt(index);
    let digit;
    if (base === 32) {
      if (code >= 95 && code <= 126) { digit = code - 95; terminated = true; }
      else if (code >= 63 && code <= 94) digit = code - 63;
      else break;
    } else if (code >= 191 && code <= 254) { digit = code - 191; terminated = true; }
    else if (code >= 63 && code <= 126) digit = code - 63;
    else break;
    value += digit * multiplier;
    multiplier *= base;
    index += 1;
    if (terminated) break;
  }
  if (!terminated) return null;
  return { value: value % 2 ? -Math.ceil(value / 2) : value / 2, next: index };
}

function decodeHpglEncodedPoints(data, initialPoint = [0, 0]) {
  let index = 0;
  let base = 64;
  let absolute = false;
  let penDown = true;
  let fractionalBits = 0;
  let current = [...initialPoint];
  let activePath = [];
  const paths = [];
  const flush = () => { if (activePath.length >= 3) paths.push(activePath); activePath = []; };
  while (index < data.length) {
    const flag = data[index];
    if (flag === "7") { base = 32; index += 1; continue; }
    if (flag === "=") { absolute = true; index += 1; continue; }
    if (flag === "<") { penDown = false; flush(); index += 1; continue; }
    if (flag === ">") {
      const decoded = decodeHpglEncodedValue(data, index + 1, base);
      if (!decoded) break;
      fractionalBits = decoded.value; index = decoded.next; continue;
    }
    if (flag === ":") {
      const decoded = decodeHpglEncodedValue(data, index + 1, base);
      if (!decoded) break;
      index = decoded.next; continue;
    }
    const x = decodeHpglEncodedValue(data, index, base);
    if (!x) break;
    const y = decodeHpglEncodedValue(data, x.next, base);
    if (!y) break;
    index = y.next;
    const divisor = fractionalBits ? 2 ** fractionalBits : 1;
    current = absolute ? [x.value / divisor, y.value / divisor] : [current[0] + x.value / divisor, current[1] + y.value / divisor];
    if (!penDown) { flush(); activePath = [current]; penDown = true; }
    else activePath.push(current);
  }
  flush();
  return { paths, current };
}

function parseSimplePath(d) {
  const tokens = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const points = [];
  let command = "";
  let index = 0;
  let current = [0, 0];

  while (index < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[index])) {
      command = tokens[index];
      index += 1;
    }

    if (command === "M" || command === "L") {
      current = [Number(tokens[index]), Number(tokens[index + 1])];
      points.push([...current]);
      index += 2;
    } else if (command === "m" || command === "l") {
      current = [current[0] + Number(tokens[index]), current[1] + Number(tokens[index + 1])];
      points.push([...current]);
      index += 2;
    } else if (command === "H") {
      current = [Number(tokens[index]), current[1]];
      points.push([...current]);
      index += 1;
    } else if (command === "h") {
      current = [current[0] + Number(tokens[index]), current[1]];
      points.push([...current]);
      index += 1;
    } else if (command === "V") {
      current = [current[0], Number(tokens[index])];
      points.push([...current]);
      index += 1;
    } else if (command === "v") {
      current = [current[0], current[1] + Number(tokens[index])];
      points.push([...current]);
      index += 1;
    } else if (command.toLowerCase() === "z") {
      index += 1;
    } else {
      break;
    }
  }
  return points;
}

function createImportedPiece(points, name) {
  const normalized = normalizeImportedPoints(points);
  if (!normalized) return false;
  const id = `imported-${importedCount}`;
  pieces.push({
    id,
    name,
    model: "",
    size: "",
    x: normalized.x,
    y: normalized.y,
    rotation: 0,
    grainAngle: 0,
    seamAllowance: 0,
    mirrored: false,
    locked: false,
    color: "#475569",
    notches: [],
    points: normalized.points,
  });
  selectedId = id;
  importedCount += 1;
  return true;
}

function importSvg(text) {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const shapes = [...doc.querySelectorAll("polygon, polyline, path")];
  let created = 0;
  shapes.forEach((shape) => {
    let points = [];
    if (shape.tagName.toLowerCase() === "path") {
      points = parseSimplePath(shape.getAttribute("d") || "");
    } else {
      points = parsePointList(shape.getAttribute("points") || "");
    }
    if (createImportedPiece(points, `Importada ${importedCount}`)) created += 1;
  });
  updateImportStatus(created ? `${created} peca(s) importada(s) do SVG.` : "SVG sem poligonos simples importaveis.");
  draw();
}

function dxfPairs(text) {
  const lines = text.replace(/\r/g, "").split("\n").map((line) => line.trim());
  const pairs = [];
  for (let index = 0; index + 1 < lines.length; index += 2) {
    pairs.push([lines[index], lines[index + 1]]);
  }
  return pairs;
}

function importDxf(text) {
  const pairs = dxfPairs(text);
  let created = 0;

  for (let index = 0; index < pairs.length; index += 1) {
    const [code, value] = pairs[index];

    if (code === "0" && value === "LWPOLYLINE") {
      const points = [];
      index += 1;
      while (index < pairs.length && pairs[index][0] !== "0") {
        if (pairs[index][0] === "10") {
          const x = Number(pairs[index][1]);
          let y = 0;
          if (pairs[index + 1]?.[0] === "20") {
            y = Number(pairs[index + 1][1]);
            index += 1;
          }
          points.push([x, y]);
        }
        index += 1;
      }
      index -= 1;
      if (createImportedPiece(points, `DXF ${importedCount}`)) created += 1;
    }

    if (code === "0" && value === "POLYLINE") {
      const points = [];
      index += 1;
      while (index < pairs.length) {
        if (pairs[index][0] === "0" && pairs[index][1] === "SEQEND") break;
        if (pairs[index][0] === "0" && pairs[index][1] === "VERTEX") {
          let x = null;
          let y = null;
          index += 1;
          while (index < pairs.length && pairs[index][0] !== "0") {
            if (pairs[index][0] === "10") x = Number(pairs[index][1]);
            if (pairs[index][0] === "20") y = Number(pairs[index][1]);
            index += 1;
          }
          if (x !== null && y !== null) points.push([x, y]);
          index -= 1;
        }
        index += 1;
      }
      if (createImportedPiece(points, `DXF ${importedCount}`)) created += 1;
    }

    if (code === "0" && value === "LINE") {
      let x1 = null;
      let y1 = null;
      let x2 = null;
      let y2 = null;
      index += 1;
      while (index < pairs.length && pairs[index][0] !== "0") {
        if (pairs[index][0] === "10") x1 = Number(pairs[index][1]);
        if (pairs[index][0] === "20") y1 = Number(pairs[index][1]);
        if (pairs[index][0] === "11") x2 = Number(pairs[index][1]);
        if (pairs[index][0] === "21") y2 = Number(pairs[index][1]);
        index += 1;
      }
      index -= 1;
      if ([x1, y1, x2, y2].every((number) => number !== null)) {
        const thickness = 0.2;
        const points = [
          [x1, y1],
          [x2, y2],
          [x2 + thickness, y2 + thickness],
          [x1 + thickness, y1 + thickness],
        ];
        if (createImportedPiece(points, `Linha DXF ${importedCount}`)) created += 1;
      }
    }
  }

  updateImportStatus(created ? `${created} entidade(s) importada(s) do DXF.` : "DXF sem LINE/POLYLINE simples importavel.");
  draw();
}

function importPlt(text) {
  const rawCommands = text
    .replace(/\s+/g, "")
    .split(";")
    .map((command) => command.trim())
    .filter(Boolean);
  const commands = [];
  rawCommands.forEach((command) => {
    // Alguns drivers concatenam o PE imediatamente após PW, sem outro ';'.
    const embeddedPe = command.indexOf("PE", 2);
    if (embeddedPe > 0) {
      commands.push(command.slice(0, embeddedPe));
      commands.push(command.slice(embeddedPe));
    } else commands.push(command);
  });
  const paths = [];
  let current = [0, 0];
  let drawing = false;
  let activePath = [];

  commands.forEach((command) => {
    const op = command.slice(0, 2).toUpperCase();
    if (op === "PE") {
      if (activePath.length >= 3) paths.push(activePath);
      activePath = [];
      const decoded = decodeHpglEncodedPoints(command.slice(2), current);
      paths.push(...decoded.paths);
      current = decoded.current;
      drawing = true;
      return;
    }
    const coords = parsePointList(command.slice(2));
    if (op === "PU") {
      if (activePath.length >= 3) paths.push(activePath);
      activePath = [];
      drawing = false;
      if (coords.length) current = coords[coords.length - 1];
    }
    if (op === "PD") {
      drawing = true;
      if (!activePath.length) activePath.push(current);
      coords.forEach((point) => {
        activePath.push(point);
        current = point;
      });
    }
    if (op === "PA" && coords.length) {
      coords.forEach((point) => {
        current = point;
        if (drawing) activePath.push(point);
      });
    }
    if (op === "PR" && coords.length) {
      coords.forEach(([x, y]) => {
        current = [current[0] + x, current[1] + y];
        if (drawing) activePath.push(current);
      });
    }
  });

  if (activePath.length >= 3) paths.push(activePath);
  let created = 0;
  paths.forEach((points) => {
    const scaled = points.map(([x, y]) => [x / 40, y / 40]);
    if (createImportedPiece(scaled, `PLT ${importedCount}`)) created += 1;
  });

  updateImportStatus(created ? `${created} caminho(s) importado(s) do PLT/HPGL2.` : "PLT sem caminhos HPGL/HPGL2 importaveis.");
  draw();
}

function importVectorFile(file) {
  if (!file) return;
  const extension = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();
  reader.onload = () => {
    const text = extension === "plt"
      ? Array.from(new Uint8Array(reader.result), (byte) => String.fromCharCode(byte)).join("")
      : String(reader.result);
    if (["svg", "dxf", "plt"].includes(extension)) recordHistory();
    if (extension === "svg") importSvg(text);
    else if (extension === "dxf") importDxf(text);
    else if (extension === "plt") importPlt(text);
    else updateImportStatus(`.${extension} nao suportado neste prototipo.`);
  };
  if (extension === "plt") reader.readAsArrayBuffer(file);
  else reader.readAsText(file);
}

function importImage(file) {
  if (!file) return;
  const image = new Image();
  image.onload = () => {
    loadImageForDigitizing(image, "Clique dois pontos na imagem e informe a medida real.");
  };
  image.src = URL.createObjectURL(file);
}

function loadImageForDigitizing(image, message) {
  backgroundImage = image;
  const widthCm = 90;
  background = {
    x: 8,
    y: 8,
    widthCm,
    heightCm: widthCm * (image.height / image.width),
  };
  calibrationPoints = [];
  contourPoints = [];
  mode = "calibrate";
  updateDigitizeStatus(message);
  draw();
}

function setCameraControls(active) {
  ui.cameraPreview.hidden = !active;
  ui.captureCamera.disabled = !active;
  ui.stopCamera.disabled = !active;
  ui.startCamera.disabled = active;
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    updateDigitizeStatus("Camera nao disponivel neste navegador.");
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
    ui.cameraPreview.srcObject = cameraStream;
    await ui.cameraPreview.play();
    setCameraControls(true);
    updateDigitizeStatus("Camera aberta. Posicione o molde inteiro e use Capturar.");
  } catch (error) {
    updateDigitizeStatus("Nao consegui abrir a camera. Use HTTPS, localhost ou importe uma foto.");
  }
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  ui.cameraPreview.pause();
  ui.cameraPreview.srcObject = null;
  setCameraControls(false);
  updateDigitizeStatus("Camera fechada.");
}

function captureCameraFrame() {
  if (!cameraStream || !ui.cameraPreview.videoWidth) {
    updateDigitizeStatus("Abra a camera antes de capturar.");
    return;
  }
  const capture = document.createElement("canvas");
  capture.width = ui.cameraPreview.videoWidth;
  capture.height = ui.cameraPreview.videoHeight;
  const captureCtx = capture.getContext("2d");
  captureCtx.drawImage(ui.cameraPreview, 0, 0, capture.width, capture.height);
  const image = new Image();
  image.onload = () => {
    loadImageForDigitizing(image, "Quadro capturado. Calibre a escala ou use Auto digitalizar.");
  };
  image.src = capture.toDataURL("image/jpeg", 0.92);
}

function loadScannerFrame(dataUrl, message = "Frame recebido do celular. Calibre a escala ou use Auto digitalizar.") {
  const image = new Image();
  image.onload = () => loadImageForDigitizing(image, message);
  image.src = dataUrl;
}

function handleScannerPayload(payload, message) {
  if (payload.id && payload.id === latestScannerFrameId) return;
  latestScannerFrameId = payload.id || String(payload.capturedAt || Date.now());
  loadScannerFrame(payload.dataUrl, message);
  ui.scannerStatus.textContent = "Frame recebido do celular.";
}

async function pollLatestScannerFrame() {
  if (!/^https?:$/.test(location.protocol)) return;
  try {
    const response = await fetch("/scanner-latest-frame.json", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.frame?.dataUrl) {
      handleScannerPayload(payload.frame, "Frame recebido por fallback HTTP. Calibre a escala ou use Auto digitalizar.");
    }
  } catch (error) {
    // Polling is best-effort; WebSocket remains the primary path.
  }
}

async function connectLocalScanner() {
  if (!/^https?:$/.test(location.protocol)) {
    ui.scannerStatus.textContent = "Para gerar QR: execute abrir-scanner-local.cmd e abra http://localhost:8787.";
    ui.scannerUrl.textContent = "O QR nao aparece quando abre o index.html direto.";
    return;
  }
  try {
    const infoResponse = await fetch("/scanner-info.json", { cache: "no-store" });
    if (infoResponse.ok) {
      const info = await infoResponse.json();
      ui.scannerUrl.textContent = info.mobileUrl || "";
      if (info.mobileUrl) {
        ui.scannerQr.src = `${info.qrUrl || "/scanner-qr.svg"}?t=${Date.now()}`;
        ui.scannerQr.hidden = false;
      }
    }
  } catch (error) {
    ui.scannerStatus.textContent = "Servidor local sem informacao de QR. Execute abrir-scanner-local.cmd.";
  }

  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  scannerSocket = new WebSocket(`${protocol}//${location.host}/ws/desktop`);
  scannerSocket.addEventListener("open", () => {
    ui.requestScannerFrame.disabled = false;
    ui.scannerStatus.textContent = "Scanner local conectado. Escaneie o QR no celular.";
  });
  scannerSocket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.type === "frame" && payload.dataUrl) {
      handleScannerPayload(payload, "Frame recebido por WebSocket. Calibre a escala ou use Auto digitalizar.");
    }
    if (payload.type === "phone-status") {
      ui.scannerStatus.textContent = payload.message;
    }
  });
  scannerSocket.addEventListener("close", () => {
    ui.requestScannerFrame.disabled = true;
    ui.scannerStatus.textContent = "Scanner local desconectado.";
  });
  scannerPollTimer = window.setInterval(pollLatestScannerFrame, 1500);
}

function requestScannerFrame() {
  if (!scannerSocket || scannerSocket.readyState !== WebSocket.OPEN) {
    updateDigitizeStatus("Scanner local nao conectado.");
    return;
  }
  scannerSocket.send(JSON.stringify({ type: "capture" }));
  updateDigitizeStatus("Solicitando captura do celular...");
}

function calibrateImage() {
  if (!background || calibrationPoints.length !== 2) return;
  const reference = Number(ui.calibrationLength.value);
  const current = Math.hypot(
    calibrationPoints[1][0] - calibrationPoints[0][0],
    calibrationPoints[1][1] - calibrationPoints[0][1],
  );
  if (!current || !reference) return;

  const factor = reference / current;
  background.widthCm *= factor;
  background.heightCm *= factor;
  calibrationPoints = [];
  mode = "trace";
  updateDigitizeStatus("Calibrado. Clique no contorno do molde e depois use Fechar.");
  draw();
}

function finishTrace() {
  if (contourPoints.length < 3) {
    updateDigitizeStatus("Marque pelo menos 3 pontos para criar uma peca.");
    return;
  }
  recordHistory();
  const box = bounds(contourPoints);
  const points = contourPoints.map(([x, y]) => [x - box.minX, y - box.minY]);
  const isDrawn = mode === "draw";
  const id = `${isDrawn ? "drawn" : "digitized"}-${digitizedCount}`;
  pieces.push({
    id,
    name: `${isDrawn ? "Desenhada" : "Digitalizada"} ${digitizedCount}`,
    model: "",
    size: "",
    x: box.minX,
    y: box.minY,
    rotation: 0,
    grainAngle: 0,
    seamAllowance: 0,
    mirrored: false,
    locked: false,
    color: "#0891b2",
    notches: [],
    points,
  });
  digitizedCount += 1;
  selectedId = id;
  contourPoints = [];
  mode = "points";
  updateDigitizeStatus("Peca criada. Ajuste os pontos se precisar.");
  draw();
}

function morphMask(mask, width, height, modeName) {
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let active = modeName === "erode";
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          const value = nx >= 0 && nx < width && ny >= 0 && ny < height ? mask[ny * width + nx] : 0;
          if (modeName === "dilate" && value) active = true;
          if (modeName === "erode" && !value) active = false;
        }
      }
      output[y * width + x] = active ? 1 : 0;
    }
  }
  return output;
}

function cleanupTraceMask(mask, width, height) {
  return morphMask(morphMask(morphMask(mask, width, height, "dilate"), width, height, "erode"), width, height, "dilate");
}

function largestMaskComponent(mask, width, height) {
  const visited = new Uint8Array(width * height);
  let bestComponent = [];
  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];

  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index] || visited[index]) continue;
    const stack = [index];
    const component = [];
    visited[index] = 1;
    while (stack.length) {
      const current = stack.pop();
      component.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      neighbors.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
        const next = ny * width + nx;
        if (!mask[next] || visited[next]) return;
        visited[next] = 1;
        stack.push(next);
      });
    }
    if (component.length > bestComponent.length) bestComponent = component;
  }

  return bestComponent;
}

function boundaryPixels(component, width, height) {
  const componentSet = new Set(component);
  return component.filter((index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return true;
        if (!componentSet.has(ny * width + nx)) return true;
      }
    }
    return false;
  });
}

function simplifyContour(points, minDistance) {
  return points.filter((point, index) => {
    if (index === 0) return true;
    const previous = points[index - 1];
    return Math.hypot(point.x - previous.x, point.y - previous.y) >= minDistance;
  });
}

function scanlineContour(component, width, height) {
  const rowBounds = new Map();
  const colBounds = new Map();

  component.forEach((index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    const row = rowBounds.get(y) || { min: x, max: x };
    row.min = Math.min(row.min, x);
    row.max = Math.max(row.max, x);
    rowBounds.set(y, row);
    const col = colBounds.get(x) || { min: y, max: y };
    col.min = Math.min(col.min, y);
    col.max = Math.max(col.max, y);
    colBounds.set(x, col);
  });

  const rows = [...rowBounds.keys()].sort((a, b) => a - b);
  const cols = [...colBounds.keys()].sort((a, b) => a - b);
  const rowStep = Math.max(1, Math.round(rows.length / 120));
  const colStep = Math.max(1, Math.round(cols.length / 60));
  const topEdge = [];
  const rightEdge = [];
  const bottomEdge = [];
  const leftEdge = [];

  for (let index = 0; index < cols.length; index += colStep) {
    const x = cols[index];
    const boundsForCol = colBounds.get(x);
    topEdge.push({ x, y: boundsForCol.min });
  }
  for (let index = 0; index < rows.length; index += rowStep) {
    const y = rows[index];
    const boundsForRow = rowBounds.get(y);
    rightEdge.push({ x: boundsForRow.max, y });
  }
  for (let index = cols.length - 1; index >= 0; index -= colStep) {
    const x = cols[index];
    const boundsForCol = colBounds.get(x);
    bottomEdge.push({ x, y: boundsForCol.max });
  }
  for (let index = rows.length - 1; index >= 0; index -= rowStep) {
    const y = rows[index];
    const boundsForRow = rowBounds.get(y);
    leftEdge.push({ x: boundsForRow.min, y });
  }

  return simplifyContour([...topEdge, ...rightEdge, ...bottomEdge, ...leftEdge], Math.max(2, Math.min(width, height) * 0.008));
}

function colorDistance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function grayscalePixels(data) {
  const gray = new Uint8Array(data.length / 4);
  for (let index = 0; index < gray.length; index += 1) {
    const offset = index * 4;
    gray[index] = Math.round(data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114);
  }
  return gray;
}

function otsuThreshold(gray) {
  const histogram = new Array(256).fill(0);
  gray.forEach((value) => { histogram[value] += 1; });
  const total = gray.length;
  let sum = 0;
  for (let value = 0; value < 256; value += 1) sum += value * histogram[value];
  let sumBackground = 0;
  let weightBackground = 0;
  let bestVariance = -1;
  let bestThreshold = 127;

  for (let value = 0; value < 256; value += 1) {
    weightBackground += histogram[value];
    if (!weightBackground) continue;
    const weightForeground = total - weightBackground;
    if (!weightForeground) break;
    sumBackground += value * histogram[value];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const variance = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;
    if (variance > bestVariance) {
      bestVariance = variance;
      bestThreshold = value;
    }
  }

  return bestThreshold;
}

function connectedMaskComponents(mask, width, height, minPixels = 24) {
  const visited = new Uint8Array(width * height);
  const components = [];
  const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index] || visited[index]) continue;
    const stack = [index];
    const pixels = [];
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    visited[index] = 1;

    while (stack.length) {
      const current = stack.pop();
      const x = current % width;
      const y = Math.floor(current / width);
      pixels.push(current);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      neighbors.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
        const next = ny * width + nx;
        if (!mask[next] || visited[next]) return;
        visited[next] = 1;
        stack.push(next);
      });
    }
    if (pixels.length >= minPixels) components.push({ pixels, minX, maxX, minY, maxY });
  }

  return components;
}

function drawImageSample(maxSize = 720) {
  if (!backgroundImage) return null;
  const scale = Math.min(1, maxSize / Math.max(backgroundImage.width, backgroundImage.height));
  const width = Math.max(1, Math.round(backgroundImage.width * scale));
  const height = Math.max(1, Math.round(backgroundImage.height * scale));
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = width;
  sampleCanvas.height = height;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.drawImage(backgroundImage, 0, 0, width, height);
  return { width, height, scale, data: sampleCtx.getImageData(0, 0, width, height).data };
}

function detectArucoMarkers() {
  const sample = drawImageSample(900);
  if (!sample) return [];
  const { width, height, data, scale } = sample;
  const gray = grayscalePixels(data);
  const threshold = Math.min(110, otsuThreshold(gray));
  const mask = new Uint8Array(width * height);
  for (let index = 0; index < gray.length; index += 1) {
    if (gray[index] < threshold) mask[index] = 1;
  }

  return connectedMaskComponents(mask, width, height, 36)
    .map((component) => {
      const boxWidth = component.maxX - component.minX + 1;
      const boxHeight = component.maxY - component.minY + 1;
      const ratio = boxWidth / Math.max(1, boxHeight);
      const area = boxWidth * boxHeight;
      const density = component.pixels.length / Math.max(1, area);
      return { ...component, boxWidth, boxHeight, ratio, density, sidePixels: (boxWidth + boxHeight) / (2 * scale) };
    })
    .filter((component) => component.boxWidth >= 18 && component.boxHeight >= 18)
    .filter((component) => component.ratio > 0.72 && component.ratio < 1.38)
    .filter((component) => component.density > 0.16 && component.density < 0.82)
    .sort((a, b) => b.sidePixels - a.sidePixels);
}

function calibrateWithArucoMarker(showOnly = false) {
  if (!backgroundImage || !background) {
    updateDigitizeStatus("Importe uma imagem antes de detectar ArUco.");
    return false;
  }
  const markerSizeCm = Number(ui.arucoMarkerSize.value);
  if (!markerSizeCm || markerSizeCm <= 0) {
    updateDigitizeStatus("Informe o tamanho real do marcador ArUco em centimetros.");
    return false;
  }
  const marker = detectArucoMarkers()[0];
  if (!marker) {
    updateDigitizeStatus("Nao encontrei um marcador ArUco/quadrado forte. Use boa luz e marcador com borda preta.");
    return false;
  }

  const cmPerPixel = markerSizeCm / marker.sidePixels;
  background.widthCm = backgroundImage.width * cmPerPixel;
  background.heightCm = backgroundImage.height * cmPerPixel;
  calibrationPoints = [];
  mode = showOnly ? "calibrate" : "trace";
  updateDigitizeStatus(`ArUco detectado: escala calibrada por marcador de ${markerSizeCm} cm.`);
  draw();
  return true;
}

let scikitWorker;
const scikitRequests = new Map();

function rejectScikitRequests(message) {
  for (const { reject, timeoutId } of scikitRequests.values()) {
    clearTimeout(timeoutId);
    reject(new Error(message));
  }
  scikitRequests.clear();
}

function getScikitWorker() {
  if (scikitWorker) return scikitWorker;
  if (!("Worker" in window)) throw new Error("Este navegador nao oferece Web Workers.");

  scikitWorker = new Worker("skimage-worker.js");
  scikitWorker.addEventListener("message", (event) => {
    const { type, requestId, payload, error, message } = event.data || {};
    if (type === "status" && message) {
      updateDigitizeStatus(message);
      return;
    }
    const pending = scikitRequests.get(requestId);
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    scikitRequests.delete(requestId);
    if (type === "result") pending.resolve(payload);
    else pending.reject(new Error(error || "Falha ao executar scikit-image."));
  });
  scikitWorker.addEventListener("error", () => {
    rejectScikitRequests("O motor scikit-image foi interrompido.");
    scikitWorker?.terminate();
    scikitWorker = undefined;
  });
  return scikitWorker;
}

function digitizeWithScikit(dataUrl, maxPoints = 220) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID?.() || `scikit-${Date.now()}-${Math.random()}`;
    const timeoutId = setTimeout(() => {
      scikitRequests.delete(requestId);
      reject(new Error("O processamento scikit-image excedeu dois minutos."));
    }, 120000);
    scikitRequests.set(requestId, { resolve, reject, timeoutId });
    getScikitWorker().postMessage({ type: "digitize", requestId, dataUrl, maxPoints });
  });
}

async function traceWithScikitBrowser() {
  const width = Math.min(1600, backgroundImage.width);
  const height = Math.max(1, Math.round(width * (backgroundImage.height / backgroundImage.width)));
  const uploadCanvas = document.createElement("canvas");
  uploadCanvas.width = width;
  uploadCanvas.height = height;
  const uploadCtx = uploadCanvas.getContext("2d");
  uploadCtx.drawImage(backgroundImage, 0, 0, width, height);
  updateDigitizeStatus("Preparando o scikit-image no navegador...");
  const payload = await digitizeWithScikit(uploadCanvas.toDataURL("image/jpeg", 0.9), 220);
  if (!payload?.ok || !Array.isArray(payload.points)) throw new Error("Resposta scikit-image invalida.");

  const tracedPoints = payload.points.map(({ x, y }) => [
    background.x + (x / payload.width) * background.widthCm,
    background.y + (y / payload.height) * background.heightCm,
  ]);
  if (tracedPoints.length < 12) throw new Error("Contorno scikit-image incompleto.");

  contourPoints = tracedPoints;
  mode = "trace";
  finishTrace();
  updateDigitizeStatus(`Auto digitalizacao scikit-image real criada com ${tracedPoints.length} pontos.`);
  return true;
}

async function traceImageContour() {
  if (!backgroundImage || !background) {
    updateDigitizeStatus("Importe uma imagem antes de auto digitalizar.");
    return;
  }

  const engine = ui.digitizeEngine.value || "local";
  if (engine === "aruco" && !calibrateWithArucoMarker(false)) return;
  if (engine === "scikit") {
    try {
      await traceWithScikitBrowser();
      return;
    } catch (error) {
      updateDigitizeStatus(`${error.message} Usando fallback local.`);
    }
  }

  const maxSize = 640;
  const scale = Math.min(1, maxSize / Math.max(backgroundImage.width, backgroundImage.height));
  const width = Math.max(1, Math.round(backgroundImage.width * scale));
  const height = Math.max(1, Math.round(backgroundImage.height * scale));
  const traceCanvas = document.createElement("canvas");
  traceCanvas.width = width;
  traceCanvas.height = height;
  const traceCtx = traceCanvas.getContext("2d", { willReadFrequently: true });
  traceCtx.drawImage(backgroundImage, 0, 0, width, height);
  const { data } = traceCtx.getImageData(0, 0, width, height);
  const gray = grayscalePixels(data);
  const globalThreshold = otsuThreshold(gray);
  const lum = (index) => data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
  const rgb = (index) => ({ r: data[index], g: data[index + 1], b: data[index + 2] });
  const borderSamples = [];

  for (let x = 0; x < width; x += 8) {
    borderSamples.push(rgb(x * 4));
    borderSamples.push(rgb(((height - 1) * width + x) * 4));
  }
  for (let y = 0; y < height; y += 8) {
    borderSamples.push(rgb(y * width * 4));
    borderSamples.push(rgb((y * width + width - 1) * 4));
  }

  const backgroundColor = borderSamples.reduce(
    (acc, sample) => ({ r: acc.r + sample.r, g: acc.g + sample.g, b: acc.b + sample.b }),
    { r: 0, g: 0, b: 0 },
  );
  backgroundColor.r /= Math.max(1, borderSamples.length);
  backgroundColor.g /= Math.max(1, borderSamples.length);
  backgroundColor.b /= Math.max(1, borderSamples.length);
  const backgroundLum = backgroundColor.r * 0.299 + backgroundColor.g * 0.587 + backgroundColor.b * 0.114;
  const borderDistances = borderSamples.map((sample) => colorDistance(sample, backgroundColor));
  const averageBorderDistance = borderDistances.reduce((total, value) => total + value, 0) / Math.max(1, borderDistances.length);
  const colorThreshold = Math.max(42, averageBorderDistance * 2.8);
  const darkLineThreshold = Math.max(30, backgroundLum * 0.14);
  const mask = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3];
      const pixelColor = rgb(offset);
      const pixelLum = lum(offset);
      const awayFromBackground = colorDistance(pixelColor, backgroundColor) > colorThreshold;
      const darkLine = pixelLum < backgroundLum - darkLineThreshold;
      const opencvDark = engine !== "local" && pixelLum < globalThreshold - 4;
      const left = x > 0 ? gray[y * width + x - 1] : gray[y * width + x];
      const top = y > 0 ? gray[(y - 1) * width + x] : gray[y * width + x];
      const skimageEdge = engine === "scikit" && Math.abs(gray[y * width + x] - left) + Math.abs(gray[y * width + x] - top) > 52;
      if (alpha > 32 && (awayFromBackground || darkLine || opencvDark || skimageEdge)) mask[y * width + x] = 1;
    }
  }

  const cleanMask = engine === "local"
    ? cleanupTraceMask(mask, width, height)
    : cleanupTraceMask(morphMask(mask, width, height, "erode"), width, height);
  const bestComponent = largestMaskComponent(cleanMask, width, height);

  if (bestComponent.length < 80) {
    updateDigitizeStatus("Nao encontrei um contorno forte. Tente uma imagem com mais contraste.");
    return;
  }

  const scannedPoints = scanlineContour(bestComponent, width, height);
  const simplifiedPoints = simplifyContour(scannedPoints, Math.max(3, Math.min(width, height) * 0.012));
  const tracedPoints = simplifiedPoints
    .map(({ x, y }) => [
      background.x + (x / width) * background.widthCm,
      background.y + (y / height) * background.heightCm,
    ]);

  if (tracedPoints.length < 12) {
    updateDigitizeStatus("Contorno automatico incompleto. Use a digitalizacao manual nesta imagem.");
    return;
  }

  contourPoints = tracedPoints;
  mode = "trace";
  finishTrace();
  const engineLabel = { local: "JS local", opencv: "OpenCV", scikit: "scikit-image", aruco: "ArUco + OpenCV" }[engine] || "JS local";
  updateDigitizeStatus(`Auto digitalizacao ${engineLabel} criada com ${tracedPoints.length} pontos. Ajuste os pontos se precisar.`);
}

canvas.addEventListener("pointerdown", (event) => {
  closeMenus();
  const screen = eventScreen(event);
  const point = screenToWorld(screen[0], screen[1]);
  const snappedPoint = snapPoint(point);

  if (mode === "pan") {
    dragState = { type: "pan", screen };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
    return;
  }

  if (mode === "calibrate") {
    if (!background) {
      updateDigitizeStatus("Importe uma imagem antes de calibrar.");
      return;
    }
    calibrationPoints.push(point);
    if (calibrationPoints.length > 2) calibrationPoints = [point];
    if (calibrationPoints.length === 2) calibrateImage();
    else updateDigitizeStatus("Agora clique o segundo ponto da medida de referencia.");
    draw();
    return;
  }

  if (mode === "trace") {
    if (!background) {
      updateDigitizeStatus("Importe uma imagem antes de digitalizar.");
      return;
    }
    contourPoints.push(point);
    updateDigitizeStatus(`${contourPoints.length} pontos marcados. Use Fechar contorno quando completar.`);
    draw();
    return;
  }

  if (mode === "draw") {
    contourPoints.push(snappedPoint);
    updateDigitizeStatus(`${contourPoints.length} pontos desenhados. Use Fechar contorno para criar a peca.`);
    draw();
    return;
  }

  if (mode === "measure") {
    measurePoints.push(point);
    if (measurePoints.length > 2) measurePoints = [point];
    if (measurePoints.length === 2) {
      updateDigitizeStatus(`Medida: ${measureDistance().toFixed(2)} cm.`);
    } else {
      updateDigitizeStatus("Clique o segundo ponto para medir.");
    }
    draw();
    return;
  }

  if (mode === "points") {
    const vertex = vertexAt(screen);
    if (vertex) {
      if (vertex.piece.locked) {
        updateImportStatus("Desbloqueie a peca antes de editar pontos.");
        return;
      }
      recordHistory();
      selectedPointIndex = vertex.index;
      dragState = { type: "vertex", pieceId: vertex.piece.id, pointIndex: vertex.index };
      canvas.setPointerCapture(event.pointerId);
      draw();
      return;
    }

    const edge = edgeAt(screen);
    if (edge) {
      if (edge.piece.locked) {
        updateImportStatus("Desbloqueie a peca antes de inserir ponto.");
        return;
      }
      recordHistory();
      const localPoint = inverseTransformedPoint(edge.piece, snappedPoint);
      edge.piece.points.splice(edge.insertAfter + 1, 0, localPoint);
      edge.piece.notches = (edge.piece.notches || []).map((pointIndex) =>
        pointIndex > edge.insertAfter ? pointIndex + 1 : pointIndex,
      );
      selectedPointIndex = edge.insertAfter + 1;
      updateImportStatus(`Ponto inserido em ${edge.piece.name}.`);
      draw();
      return;
    }
  }

  const piece = pieceAt(point);
  if (!piece) return;
  selectedId = piece.id;
  selectedPointIndex = null;
  if (mode === "move") {
    if (piece.locked) {
      updateImportStatus("Peca bloqueada. Desbloqueie antes de mover.");
      draw();
      return;
    }
    recordHistory();
    dragState = {
      type: "piece",
      pieceId: piece.id,
      offsetX: snappedPoint[0] - piece.x,
      offsetY: snappedPoint[1] - piece.y,
    };
    canvas.setPointerCapture(event.pointerId);
  }
  draw();
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const piece = pieceAt(eventWorld(event));
  if (!piece) {
    openCanvasContextMenu(event);
    return;
  }
  openPieceContextMenu(event, piece);
});

canvas.addEventListener("pointermove", (event) => {
  const screen = eventScreen(event);
  const point = screenToWorld(screen[0], screen[1]);
  updateCursorStatus(point);
  if (!dragState) return;
  const snappedPoint = snapPoint(point);

  if (dragState.type === "pan") {
    view.panX += screen[0] - dragState.screen[0];
    view.panY += screen[1] - dragState.screen[1];
    dragState.screen = screen;
  }

  if (dragState.type === "piece") {
    const piece = pieces.find((item) => item.id === dragState.pieceId);
    piece.x = snappedPoint[0] - dragState.offsetX;
    piece.y = snappedPoint[1] - dragState.offsetY;
  }

  if (dragState.type === "vertex") {
    const piece = pieces.find((item) => item.id === dragState.pieceId);
    piece.points[dragState.pointIndex] = inverseTransformedPoint(piece, snappedPoint);
  }

  draw();
});

canvas.addEventListener("pointerleave", () => updateCursorStatus(null));

canvas.addEventListener("pointerup", (event) => {
  dragState = null;
  canvas.releasePointerCapture(event.pointerId);
  updateModeButtons();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const anchor = eventScreen(event);
  const direction = event.deltaY > 0 ? 0.9 : 1.1;
  setZoom(view.zoom * direction, anchor);
});

ui.modeMove.addEventListener("click", () => {
  mode = "move";
  selectedPointIndex = null;
  draw();
});

ui.modePoints.addEventListener("click", () => {
  mode = "points";
  draw();
});

ui.modeDraw.addEventListener("click", () => {
  mode = "draw";
  selectedPointIndex = null;
  contourPoints = [];
  updateDigitizeStatus("Modo desenho: clique no canvas para criar pontos do molde.");
  draw();
});

ui.modePan.addEventListener("click", () => {
  mode = "pan";
  selectedPointIndex = null;
  draw();
});

ui.modeMeasure.addEventListener("click", () => {
  mode = "measure";
  selectedPointIndex = null;
  measurePoints = [];
  updateDigitizeStatus("Modo medir: clique dois pontos no canvas.");
  draw();
});

ui.modeCalibrate.addEventListener("click", () => {
  mode = "calibrate";
  calibrationPoints = [];
  updateDigitizeStatus(background ? "Clique dois pontos da medida de referencia." : "Importe uma imagem antes de calibrar.");
  draw();
});

ui.modeTrace.addEventListener("click", () => {
  mode = "trace";
  selectedPointIndex = null;
  contourPoints = [];
  updateDigitizeStatus(background ? "Clique no contorno do molde." : "Importe uma imagem antes de digitalizar.");
  draw();
});

ui.zoomOut.addEventListener("click", () => setZoom(view.zoom * 0.9));
ui.zoomIn.addEventListener("click", () => setZoom(view.zoom * 1.1));
ui.resetView.addEventListener("click", () => {
  view.zoom = 1;
  view.panX = 0;
  view.panY = 0;
  draw();
});
ui.fitView.addEventListener("click", fitViewToPieces);
ui.showGrid.addEventListener("change", () => {
  updateImportStatus(ui.showGrid.checked ? "Grade visivel." : "Grade oculta.");
  draw();
});
ui.toggleGrid.addEventListener("click", () => {
  ui.showGrid.checked = !ui.showGrid.checked;
  updateImportStatus(ui.showGrid.checked ? "Grade visivel." : "Grade oculta.");
  draw();
});
ui.toggleFloatingToolbar.addEventListener("click", () => {
  floatingToolbarVisible = !floatingToolbarVisible;
  localStorage.setItem("moldelab_floating_toolbar_v2", floatingToolbarVisible ? "1" : "0");
  updateImportStatus(floatingToolbarVisible ? "Icones perto da peca visiveis." : "Icones perto da peca ocultos.");
  draw();
});

ui.rotateLeft.addEventListener("click", () => {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de girar.");
    return;
  }
  recordHistory();
  piece.rotation = (piece.rotation + 345) % 360;
  draw();
});

ui.rotateRight.addEventListener("click", () => {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de girar.");
    return;
  }
  recordHistory();
  piece.rotation = (piece.rotation + 15) % 360;
  draw();
});

ui.mirrorPiece.addEventListener("click", () => {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de espelhar.");
    return;
  }
  recordHistory();
  piece.mirrored = !piece.mirrored;
  draw();
});

ui.fitPieceOrigin.addEventListener("click", () => alignSelectedPiece("origin"));
ui.centerPieceWidth.addEventListener("click", () => alignSelectedPiece("center-width"));
ui.alignPieceLeft.addEventListener("click", () => alignSelectedPiece("left"));
ui.alignPieceTop.addEventListener("click", () => alignSelectedPiece("top"));
ui.duplicatePiece.addEventListener("click", duplicateSelectedPiece);
ui.deletePiece.addEventListener("click", deleteSelectedPiece);
ui.toggleLockPiece.addEventListener("click", toggleSelectedPieceLock);
ui.addNotch.addEventListener("click", addNotchToSelectedPoint);
ui.deleteNotch.addEventListener("click", deleteNotchFromSelectedPoint);
ui.deletePoint.addEventListener("click", deleteSelectedPoint);
ui.gradeUp.addEventListener("click", () => gradeSelectedPoint(0, -1));
ui.gradeDown.addEventListener("click", () => gradeSelectedPoint(0, 1));
ui.gradeLeft.addEventListener("click", () => gradeSelectedPoint(-1, 0));
ui.gradeRight.addEventListener("click", () => gradeSelectedPoint(1, 0));
ui.createGradeCopy.addEventListener("click", createGradingCopy);
ui.applyGradeTable.addEventListener("click", applyGradeTableToSelectedPoint);
document.querySelectorAll("[data-grade-row]").forEach((input) => {
  input.addEventListener("focus", () => setActiveGradeRow(input.dataset.gradeRow));
  input.addEventListener("click", () => setActiveGradeRow(input.dataset.gradeRow));
});
ui.gradeTableUp.addEventListener("click", () => updateActiveGradeRow(0, -1));
ui.gradeTableDown.addEventListener("click", () => updateActiveGradeRow(0, 1));
ui.gradeTableLeft.addEventListener("click", () => updateActiveGradeRow(-1, 0));
ui.gradeTableRight.addEventListener("click", () => updateActiveGradeRow(1, 0));
ui.gradeTableZero.addEventListener("click", zeroActiveGradeRow);
ui.projectName.addEventListener("input", () => updateMarkerHeader(currentMarkerStats()));
ui.pieceName.addEventListener("change", renameSelectedPiece);
ui.pieceModel.addEventListener("change", () => updateSelectedPieceMeta("model", ui.pieceModel));
ui.pieceSize.addEventListener("change", () => updateSelectedPieceMeta("size", ui.pieceSize));
ui.pieceColor.addEventListener("change", updateSelectedPieceColor);
ui.seamAllowance.addEventListener("input", updateSelectedSeamAllowance);

ui.rotation.addEventListener("input", () => {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de girar.");
    ui.rotation.value = piece.rotation;
    return;
  }
  if (piece.rotation === Number(ui.rotation.value)) return;
  recordHistory();
  piece.rotation = Number(ui.rotation.value);
  draw();
});

ui.grainAngle.addEventListener("change", () => {
  const piece = selectedPiece();
  if (!piece) return;
  if (piece.locked) {
    updateImportStatus("Desbloqueie a peca antes de alterar o fio.");
    ui.grainAngle.value = String(piece.grainAngle || 0);
    return;
  }
  if (piece.grainAngle === Number(ui.grainAngle.value)) return;
  recordHistory();
  piece.grainAngle = Number(ui.grainAngle.value);
  piece.rotation = piece.grainAngle % 360;
  draw();
});

ui.fabricWidth.addEventListener("input", () => {
  recordHistory();
  draw();
});
ui.fabricType.addEventListener("change", () => {
  recordHistory();
  draw();
});
ui.spacing.addEventListener("input", () => {
  recordHistory();
  draw();
});
ui.nestingTimer.addEventListener("input", () => {
  recordHistory();
  draw();
});
ui.toggleMarkerHeader.addEventListener("click", () => {
  closeMenus();
  recordHistory();
  setMarkerHeaderVisible(ui.markerHeader.hidden);
  updateImportStatus(ui.markerHeader.hidden ? "Cabecalho oculto." : "Cabecalho visivel.");
});
ui.autoNest.addEventListener("click", autoNest);
ui.cancelNest.addEventListener("click", cancelNesting);
ui.saveProject.addEventListener("click", saveProject);
ui.exportSvg.addEventListener("click", exportSvg);
ui.exportDxf.addEventListener("click", exportDxf);
ui.exportPlt.addEventListener("click", exportPlt);
ui.exportMiniMarker.addEventListener("click", exportMiniMarker);
ui.addPiece.addEventListener("click", addPiece);
ui.copyPiece.addEventListener("click", copySelectedPiece);
ui.pastePiece.addEventListener("click", pasteCopiedPiece);
ui.finishTrace.addEventListener("click", finishTrace);
ui.detectAruco.addEventListener("click", () => calibrateWithArucoMarker(false));
ui.autoTrace.addEventListener("click", traceImageContour);
ui.startCamera.addEventListener("click", startCamera);
ui.captureCamera.addEventListener("click", captureCameraFrame);
ui.stopCamera.addEventListener("click", stopCamera);
ui.requestScannerFrame.addEventListener("click", requestScannerFrame);
ui.undoAction.addEventListener("click", undoAction);
ui.redoAction.addEventListener("click", redoAction);
ui.pieceList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-piece-id]");
  if (!item) return;
  selectedId = item.dataset.pieceId;
  selectedPointIndex = null;
  mode = "points";
  updateImportStatus(`Peca selecionada: ${selectedPiece()?.name || ""}.`);
  draw();
});
ui.imageInput.addEventListener("change", (event) => importImage(event.target.files[0]));
ui.vectorInput.addEventListener("change", (event) => importVectorFile(event.target.files[0]));
ui.projectInput.addEventListener("change", (event) => openProject(event.target.files[0]));

ui.pieceContextMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-context-action]");
  if (!button) return;
  const actions = {
    duplicate: () => ui.duplicatePiece.click(),
    copy: () => ui.copyPiece.click(),
    "grade-copy": () => ui.createGradeCopy.click(),
    delete: () => ui.deletePiece.click(),
    lock: () => ui.toggleLockPiece.click(),
    "rotate-left": () => ui.rotateLeft.click(),
    "rotate-right": () => ui.rotateRight.click(),
    mirror: () => ui.mirrorPiece.click(),
    origin: () => ui.fitPieceOrigin.click(),
    "center-width": () => ui.centerPieceWidth.click(),
    left: () => ui.alignPieceLeft.click(),
    top: () => ui.alignPieceTop.click(),
    "add-notch": () => ui.addNotch.click(),
    "delete-notch": () => ui.deleteNotch.click(),
    "delete-point": () => ui.deletePoint.click(),
  };
  actions[button.dataset.contextAction]?.();
  closePieceContextMenu();
});

ui.canvasContextMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-canvas-action]");
  if (!button) return;
  const actions = {
    "add-piece": () => ui.addPiece.click(),
    "paste-piece": () => ui.pastePiece.click(),
    "auto-nest": () => ui.autoNest.click(),
    draw: () => ui.modeDraw.click(),
    measure: () => ui.modeMeasure.click(),
    pan: () => ui.modePan.click(),
    "zoom-in": () => ui.zoomIn.click(),
    "zoom-out": () => ui.zoomOut.click(),
    "reset-view": () => ui.resetView.click(),
    "fit-view": () => ui.fitView.click(),
    "toggle-grid": () => ui.toggleGrid.click(),
  };
  actions[button.dataset.canvasAction]?.();
  closeCanvasContextMenu();
});

ui.floatingPieceToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-float-action]");
  if (!button || button.disabled) return;
  handleFloatingToolbarAction(button.dataset.floatAction);
});

ui.floatingPieceToolbar.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});

canvas.parentElement.addEventListener("scroll", updateFloatingToolbar);
window.addEventListener("resize", updateFloatingToolbar);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (nestingRunning) {
      event.preventDefault();
      cancelNesting();
      return;
    }
    closeMenus();
    closePieceContextMenu();
    closeCanvasContextMenu();
    return;
  }

  const isTyping = isTypingTarget(event.target);
  const key = event.key.toLowerCase();
  const selection = window.getSelection();
  const hasTextSelection = Boolean(selection && !selection.isCollapsed);
  if (isTyping) return;
  if ((event.ctrlKey || event.metaKey) && key === "c" && hasTextSelection) return;
  if ((event.ctrlKey || event.metaKey) && key === "s") {
    event.preventDefault();
    saveProject();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && key === "d") {
    event.preventDefault();
    ui.duplicatePiece.click();
    closeMenus();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && key === "c") {
    event.preventDefault();
    ui.copyPiece.click();
    closeMenus();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && key === "v") {
    event.preventDefault();
    ui.pastePiece.click();
    closeMenus();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && key === "h") {
    event.preventDefault();
    ui.toggleMarkerHeader.click();
    closeMenus();
    return;
  }
  const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey;
  const isRedo = (event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"));
  const isDelete = event.key === "Delete" || event.key === "Backspace";
  if (isDelete) {
    event.preventDefault();
    if (selectedPointIndex !== null) ui.deletePoint.click();
    else ui.deletePiece.click();
    closeMenus();
    return;
  }
  const shortcutActions = {
    m: () => ui.modeMove.click(),
    p: () => ui.modePoints.click(),
    d: () => ui.modeDraw.click(),
    c: () => ui.modeCalibrate.click(),
    t: () => ui.modeTrace.click(),
    h: () => ui.modePan.click(),
    r: () => ui.modeMeasure.click(),
    f: () => ui.fitView.click(),
    g: () => ui.toggleGrid.click(),
    n: () => ui.addPiece.click(),
    "+": () => ui.zoomIn.click(),
    "=": () => ui.zoomIn.click(),
    "-": () => ui.zoomOut.click(),
    "0": () => ui.resetView.click(),
    "1": () => setZoomPercent(100),
    "2": () => setZoomPercent(250),
    "5": () => setZoomPercent(500),
    "9": () => setZoomPercent(1000),
  };
  const shortcutAction = !event.ctrlKey && !event.metaKey ? shortcutActions[key] : null;
  if (shortcutAction) {
    event.preventDefault();
    shortcutAction();
    closeMenus();
    return;
  }

  const didNudge = !event.ctrlKey && !event.metaKey && nudgeSelectedPiece(event);
  if (!isUndo && !isRedo && !didNudge) return;
  event.preventDefault();
  if (isUndo) undoAction();
  if (isRedo) redoAction();
});

setupMenuBehavior();
window.addEventListener("load", refreshIcons);
window.addEventListener("load", connectLocalScanner);
window.addEventListener("load", initAuthUi);
window.addEventListener("load", initAssistant);

async function initAuthUi() {
  const userMenu = document.querySelector("#userMenu");
  const userLabel = document.querySelector("#userLabel");
  const logoutBtn = document.querySelector("#logoutBtn");
  if (!userMenu || !userLabel || !logoutBtn) return;
  if (document.body.dataset.lightMode === "true") {
    userMenu.hidden = true;
    return;
  }

  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!response.ok) {
      window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname || "/")}`;
      return;
    }
    const data = await response.json();
    if (!data.ok || !data.user || data.user.status !== "approved") {
      window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname || "/")}`;
      return;
    }
    userLabel.textContent = data.user.name || data.user.email;
    userMenu.hidden = false;
    const adminLink = document.querySelector("#adminLink");
    if (adminLink && data.user.role === "admin") adminLink.hidden = false;
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      window.location.href = "/login.html";
    });
  } catch {
    window.location.href = "/login.html";
  }
}

function initAssistant() {
  const toggle = document.querySelector("#assistantToggle");
  const panel = document.querySelector("#assistantPanel");
  const close = document.querySelector("#assistantClose");
  const form = document.querySelector("#assistantForm");
  const input = document.querySelector("#assistantInput");
  const fileInput = document.querySelector("#assistantFiles");
  const attachments = document.querySelector("#assistantAttachments");
  const messages = document.querySelector("#assistantMessages");
  const send = document.querySelector("#assistantSend");
  if (!toggle || !panel || !close || !form || !input || !fileInput || !attachments || !messages || !send) return;

  const maxFiles = 3;
  const maxFileBytes = 4_000_000;
  const maxTotalBytes = 8_000_000;
  const historyKey = "moldelab_assistant_history_v1";
  let selectedFiles = [];
  let history = [];
  let busy = false;

  try {
    const stored = JSON.parse(sessionStorage.getItem(historyKey) || "[]");
    if (Array.isArray(stored)) history = stored.slice(-12).filter((item) =>
      item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string",
    );
  } catch {
    history = [];
  }

  function persistHistory() {
    try { sessionStorage.setItem(historyKey, JSON.stringify(history.slice(-12))); } catch { /* storage optional */ }
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function addMessage(role, content, sources = []) {
    const article = document.createElement("article");
    article.className = `assistant-message assistant-message-${role === "user" ? "user" : "bot"}`;
    const avatar = document.createElement("div");
    avatar.className = "assistant-avatar";
    avatar.textContent = role === "user" ? "V" : "M";
    const bubble = document.createElement("div");
    bubble.className = "assistant-bubble";
    bubble.textContent = content;
    if (sources.length) {
      const sourceLine = document.createElement("small");
      sourceLine.className = "assistant-sources";
      sourceLine.textContent = `Fontes: ${sources.join(", ")}`;
      bubble.appendChild(sourceLine);
    }
    article.append(avatar, bubble);
    messages.appendChild(article);
    messages.scrollTop = messages.scrollHeight;
    return article;
  }

  function renderAttachments() {
    attachments.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const chip = document.createElement("div");
      chip.className = "assistant-attachment";
      const icon = document.createElement("i");
      icon.dataset.lucide = file.type.startsWith("image/") ? "image" : "file-text";
      const name = document.createElement("span");
      name.textContent = file.name;
      name.title = file.name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remover ${file.name}`);
      remove.innerHTML = '<i data-lucide="x"></i>';
      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderAttachments();
      });
      chip.append(icon, name, remove);
      attachments.appendChild(chip);
    });
    refreshIcons();
  }

  function resizeInput() {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  async function compressPhoto(file) {
    if (!/^image\/(jpeg|png|webp|bmp)$/i.test(file.type)) return file;
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1_500_000) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  input.addEventListener("input", resizeInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  fileInput.addEventListener("change", async () => {
    const incoming = Array.from(fileInput.files || []);
    fileInput.value = "";
    for (const original of incoming) {
      if (selectedFiles.length >= maxFiles) {
        addMessage("assistant", `Você pode anexar no máximo ${maxFiles} arquivos por mensagem.`);
        break;
      }
      try {
        const file = await compressPhoto(original);
        if (file.size > maxFileBytes) {
          addMessage("assistant", `${original.name} ultrapassa o limite de 4 MB.`);
          continue;
        }
        const total = selectedFiles.reduce((sum, item) => sum + item.size, 0) + file.size;
        if (total > maxTotalBytes) {
          addMessage("assistant", "Os anexos juntos ultrapassam o limite de 8 MB.");
          break;
        }
        selectedFiles.push(file);
      } catch {
        addMessage("assistant", `Não consegui preparar ${original.name}.`);
      }
    }
    renderAttachments();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const typed = input.value.trim();
    if (!typed && !selectedFiles.length) return;
    const filesForRequest = selectedFiles.slice();
    const fileNames = filesForRequest.map((file) => file.name);
    const userText = typed || "Analise os arquivos anexados e explique o que você identifica.";
    addMessage("user", fileNames.length ? `${userText}\nAnexos: ${fileNames.join(", ")}` : userText);
    input.value = "";
    resizeInput();
    selectedFiles = [];
    renderAttachments();
    busy = true;
    send.disabled = true;
    const loading = addMessage("assistant", "Analisando a biblioteca e os anexos...");
    loading.classList.add("assistant-message-loading");

    const payload = new FormData();
    payload.append("message", userText);
    payload.append("history", JSON.stringify(history.slice(-8)));
    filesForRequest.forEach((file) => payload.append("files", file, file.name));

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        credentials: "same-origin",
        body: payload,
      });
      const data = await response.json().catch(() => ({}));
      loading.remove();
      if (!response.ok || !data.ok) throw new Error(data.error || "O assistente não conseguiu responder.");
      const answer = typeof data.answer === "string" ? data.answer : "Não recebi uma resposta legível.";
      const sources = Array.isArray(data.sources) ? data.sources.filter((item) => typeof item === "string").slice(0, 6) : [];
      addMessage("assistant", answer, sources);
      history.push({ role: "user", content: userText }, { role: "assistant", content: answer });
      history = history.slice(-12);
      persistHistory();
    } catch (error) {
      loading.remove();
      addMessage("assistant", error instanceof Error ? error.message : "Falha de conexão com o assistente.");
      selectedFiles = filesForRequest;
      renderAttachments();
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  });
}

setActiveGradeRow(activeGradeRowIndex);
setMarkerHeaderVisible(!ui.markerHeader.hidden);

// ── Initialize tab system ──
(function initTabs() {
  const firstSnap = newBlankSnapshot("MoldeLab Projeto");
  const firstId = createTab(firstSnap, cloneSnapshot(firstSnap));
  activeTabId = firstId;
  renderTabs();
  document.getElementById("tabNew").addEventListener("click", () => {
    captureCurrentTabSnapshot();
    const snap = newBlankSnapshot(`Projeto ${tabs.length + 1}`);
    const id = createTab(snap, cloneSnapshot(snap));
    activeTabId = id;
    undoStack.splice(0, undoStack.length);
    redoStack.splice(0, redoStack.length);
    restoreSnapshot(snap);
    mode = "move";
    view.zoom = 1; view.panX = 0; view.panY = 0;
    draw();
    renderTabs();
  });
  // Re-render tabs when project name changes so tab label updates
  ui.projectName.addEventListener("input", () => {
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab) {
      tab.snapshot = cloneSnapshot(projectSnapshot());
      renderTabs();
    }
  });
})();

draw();


// Scrollbar horizontal
(function() {
  const wrap = document.querySelector('.canvas-wrap');
  if (!wrap) return;

  const bar = document.createElement('div');
  bar.style.cssText = 'width:100%;height:12px;background:#e5e7eb;border-radius:6px;margin-top:2px;position:relative;display:none;';
  const thumb = document.createElement('div');
  thumb.style.cssText = 'position:absolute;top:1px;height:10px;background:#9ca3af;border-radius:5px;cursor:pointer;min-width:40px;transition:background 0.15s;';
  thumb.onmouseenter = () => thumb.style.background = '#6b7280';
  thumb.onmouseleave = () => thumb.style.background = '#9ca3af';
  bar.appendChild(thumb);
  wrap.parentElement.insertBefore(bar, wrap.nextSibling);

  function update() {
    const total = markerLength() * baseScale * view.zoom + origin.x * 2 + 100;
    const visible = canvas.width;
    if (total <= visible) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    const ratio = visible / total;
    const thumbW = Math.max(40, ratio * bar.offsetWidth);
    thumb.style.width = thumbW + 'px';
    const minPan = visible - total;
    const pos = (view.panX - minPan) / (0 - minPan);
    thumb.style.left = Math.max(0, Math.min(bar.offsetWidth - thumbW, pos * (bar.offsetWidth - thumbW))) + 'px';
  }

  // Drag to scroll
  let dragging = false, startX = 0, startPan = 0;
  thumb.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; startPan = view.panX; e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const total = markerLength() * baseScale * view.zoom + origin.x * 2 + 100;
    const visible = canvas.width;
    const thumbW = Math.max(40, (visible/total) * bar.offsetWidth);
    const trackRange = bar.offsetWidth - thumbW;
    const panRange = visible - total;
    const dx = e.clientX - startX;
    view.panX = Math.max(panRange, Math.min(0, startPan + (dx / trackRange) * panRange));
    draw(); update();
  });
  document.addEventListener('mouseup', () => dragging = false);

  setInterval(update, 150);
})();

