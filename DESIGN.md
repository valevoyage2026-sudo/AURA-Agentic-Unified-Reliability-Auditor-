# AURA UI Design System

## Primary visual reference

The canonical visual reference for the AURA dashboard is:

@reference/aura-dashboard-reference.png

The reference image defines the intended visual direction, composition,
density, hierarchy, colors, atmosphere, and interaction style.

Do not blindly reproduce every piece of text from the image.
Treat it as a visual design reference, not as literal application content.

---

# Design Philosophy

AURA is a multi-agent intelligence platform.

The UI should feel like:

- an AI operations center
- a live neural network
- a mission-control interface
- an investigative intelligence system
- mysterious and highly technical

Avoid conventional SaaS dashboard aesthetics.

The interface should feel like the user is observing an
intelligent system actively operating.

---

# Core Layout

Use a three-region desktop layout:

LEFT:
Agent/system navigation and telemetry.

CENTER:
Primary live agent network visualization.

RIGHT:
Selected agent inspector and event stream.

BOTTOM:
Execution flow and generated artifacts.

The center visualization is the visual focal point.

Do not allow side panels to visually overpower the agent network.

---

# Color System

Background:

- near-black navy
- deep blue-black surfaces
- subtle blue grid

Primary:

- electric blue
- cyan

Secondary:

- violet

Accent:

- restrained gold

Status:

- cyan = active
- blue = processing
- gold = verification / important
- violet = reasoning / analysis
- green/teal = completed
- red = failure
- muted gray-blue = idle

Do NOT use the generic purple AI gradient aesthetic.

Do NOT use excessive gradients.

---

# Typography

Prefer technical / futuristic typography.

Primary UI:

- Inter
- IBM Plex Sans
- Space Grotesk

Technical values:

- JetBrains Mono
- IBM Plex Mono

Use monospace typography for:

- telemetry
- timestamps
- token counts
- latency
- agent state
- event logs
- IDs

Typography should remain highly readable.

---

# Agent Network

The agent network is the centerpiece of the application.

Agents must NOT look like ordinary rectangular cards.

Represent agents as glowing nodes.

Example:

Orchestrator
Researcher
Searcher
Analyst
Verifier
Writer
Planner
Summarizer

Each node has:

- icon
- name
- state
- subtle glow
- activity indicator

---

# Agent States

IDLE:

Dim node with minimal animation.

ACTIVE:

Bright node with pulsing outer ring.

PROCESSING:

Animated orbital ring.

WAITING:

Slow heartbeat animation.

COMMUNICATING:

Particles travel along the connection.

COMPLETED:

Stable bright node with reduced animation.

ERROR:

Controlled red distortion/pulse.

---

# Agent Communication

Agent communication should be visualized.

When Agent A sends information to Agent B:

1. Draw the connection.
2. Animate a small particle traveling along the edge.
3. Activate Agent B when the packet arrives.
4. Show a subtle state transition.
5. Add an event to the event stream.

The user should be able to SEE information moving through the system.

Do not represent communication only with text.

---

# Orchestrator

The Orchestrator is the central node.

It should visually dominate the network.

Use:

- larger node
- multiple concentric rings
- subtle orbital animation
- stronger glow
- AURA symbol/icon

The orchestrator should feel like the system's central intelligence.

---

# Right Inspector

When an agent is selected, show:

- agent name
- state
- current task
- current operation
- progress
- input
- output
- confidence
- tokens
- latency
- model

Example:

RESEARCHER
ACTIVE

Current Task:
Find salary increase trends.

Current Operation:
Searching knowledge graph...

Progress:
72%

Output:
12 documents
4 entities
3 claims

Confidence:
87%

Tokens:
3,821

Latency:
1.4s

---

# Event Stream

Use a live event timeline.

Example:

21:04:31  Researcher awakened
21:04:32  Querying knowledge graph
21:04:33  17 entities discovered
21:04:34  Analyst activated
21:04:35  Verifier activated
21:04:37  Message sent to Verifier
21:04:38  Conflicting evidence detected
21:04:41  Secondary researcher spawned
21:04:45  Conflict resolved
21:04:48  Synthesis initiated

Events should appear dynamically.

---

# Animations

Animations should communicate system activity.

Use animation for:

- agent activation
- message transfer
- node state changes
- network discovery
- progress
- event arrival
- artifact generation

Avoid decorative animation that has no semantic meaning.

Animations should be subtle and performant.

Prefer:

- CSS animations
- SVG
- Canvas
- requestAnimationFrame where appropriate

Avoid unnecessarily heavy 3D rendering.

---

# Visual Density

The dashboard should feel information-rich.

However:

Do not clutter the interface.

Use empty dark space around the network.

Use thin borders.

Use subtle grid lines.

Use small telemetry labels.

Use restrained glow.

The result should feel sophisticated rather than noisy.

---

# Avoid

Do NOT create:

- generic SaaS dashboard
- giant rounded cards
- excessive glassmorphism
- purple AI gradients everywhere
- huge hero text
- generic chatbot UI
- excessive shadows
- excessive rounded corners
- stock AI illustrations
- meaningless animations
- excessive neon
- unnecessary 3D effects

The design should feel like an intelligence/operations system,
not a marketing website.

---

# Responsive Behavior

Desktop is the primary experience.

At smaller widths:

- collapse the left navigation
- make the right inspector a drawer
- preserve the agent network as the primary visualization
- collapse secondary telemetry
- preserve event visibility where possible

Never allow the network to become unusable.

---

# Implementation Principle

Build the UI as reusable components.

Suggested structure:

AgentNetwork
AgentNode
AgentConnection
MessageParticle
OrchestratorNode
AgentInspector
AgentList
TelemetryPanel
EventStream
ExecutionFlow
ArtifactPanel
SystemStatus

Keep visual state separate from backend state.

The frontend should be able to receive live agent events and
translate them into visual state changes.

---

# Most Important Rule

The reference image establishes the visual language.

Do not copy it literally.

Preserve its:

- composition
- hierarchy
- visual density
- color language
- node-based interaction
- technical atmosphere
- live-system feeling

while adapting the UI to AURA's actual functionality.