// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildGraphStyles(studyMode: boolean): any[] {
  return [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#e8eaf6',
        'font-family': 'Inter, system-ui, sans-serif',
        'font-size': '11px',
        'text-wrap': 'wrap',
        'text-max-width': '100px',
        'background-color': 'data(color)',
        'background-opacity': 0.15,
        'border-color': 'data(color)',
        'border-width': 2,
        'border-opacity': 0.8,
        'width': '120px',
        'height': '48px',
        'shape': 'round-rectangle',
        'padding': '10px',
        'transition-property': 'background-opacity, border-opacity, border-width',
        'transition-duration': 200,
      },
    },
    {
      selector: 'node:hover',
      style: {
        'background-opacity': 0.28,
        'border-width': 2.5,
        'cursor': 'pointer',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'background-opacity': 0.35,
        'border-width': 3,
        'border-opacity': 1,
      },
    },
    {
      selector: 'edge',
      style: {
        'label': studyMode ? '' : 'data(label)',
        'color': studyMode ? 'transparent' : '#8b90a7',
        'font-family': 'Inter, system-ui, sans-serif',
        'font-size': '9px',
        'text-background-color': '#1a1d27',
        'text-background-opacity': studyMode ? 0 : 0.85,
        'text-background-padding': '3px',
        'text-background-shape': 'round-rectangle',
        'text-border-opacity': 0,
        'text-rotation': 'autorotate',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#4f8ef7',
        'line-color': '#4f8ef7',
        'line-opacity': studyMode ? 0.5 : 0.8,
        'arrow-scale': 1.2,
        'width': 2,
        'transition-property': 'line-opacity, label',
        'transition-duration': 300,
      },
    },
    {
      selector: 'edge[?hasMechanism]',
      style: {
        'line-color': '#a78bfa',
        'target-arrow-color': '#a78bfa',
        'line-style': 'dashed',
        'line-dash-pattern': [8, 4],
      },
    },
    {
      selector: 'edge:hover',
      style: {
        'line-opacity': 1,
        'width': 2.5,
        'cursor': 'pointer',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-opacity': 1,
        'width': 3,
      },
    },
  ]
}
