"""
Retrieval Latency Benchmark Script for AURA (Day 3-4 Baseline Measurement).
Measures average execution latency (ms) across Vector (Qdrant), Graph (Neo4j), and Hybrid retrieval.
"""

import time
import logging
from typing import List
from app.retrieval.vector_store import VectorRetriever
from app.retrieval.knowledge_graph import GraphRetriever
from app.retrieval.hybrid_retriever import HybridRetriever

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SAMPLE_QUERIES = [
    "AURA is an Agentic Unified Reliability Auditor for LLMs",
    "The architecture uses LangGraph state machine and FastAPI",
    "Qdrant vector search handles semantic passage retrieval",
    "Neo4j knowledge graph stores structured entity relationships",
    "PostgreSQL handles memory and audit log persistence",
]


def benchmark_vector_search(vector_store: VectorRetriever, runs: int = 5) -> float:
    logger.info("Benchmarking Vector Search (FastEmbed + Qdrant)...")
    latencies = []
    for _ in range(runs):
        for q in SAMPLE_QUERIES:
            t0 = time.perf_counter()
            _ = vector_store.semantic_search(query=q, top_k=5, min_similarity=0.5)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000.0)
    avg_ms = sum(latencies) / len(latencies)
    logger.info(f"Vector Search Average Latency: {avg_ms:.2f} ms ({len(latencies)} iterations)")
    return avg_ms


def benchmark_graph_lookup(graph_store: GraphRetriever, runs: int = 5) -> float:
    logger.info("Benchmarking Graph Lookup (Neo4j)...")
    latencies = []
    entities = ["AURA", "LangGraph", "FastAPI"]
    for _ in range(runs):
        t0 = time.perf_counter()
        _ = graph_store.graph_lookup(entities=entities)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)
    avg_ms = sum(latencies) / len(latencies)
    logger.info(f"Graph Lookup Average Latency: {avg_ms:.2f} ms ({len(latencies)} iterations)")
    return avg_ms


def benchmark_hybrid_retrieval(hybrid_retriever: HybridRetriever, runs: int = 5) -> float:
    logger.info("Benchmarking Hybrid Retrieval...")
    latencies = []
    for _ in range(runs):
        for q in SAMPLE_QUERIES:
            t0 = time.perf_counter()
            _ = hybrid_retriever.retrieve(query_text=q)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000.0)
    avg_ms = sum(latencies) / len(latencies)
    logger.info(f"Hybrid Retrieval Average Latency: {avg_ms:.2f} ms ({len(latencies)} iterations)")
    return avg_ms


def main():
    print("=" * 60)
    print("AURA RETRIEVAL LATENCY BENCHMARK (DAY 3-4 BASELINE)")
    print("=" * 60)

    vec_store = VectorRetriever()
    graph_store = GraphRetriever()
    hybrid_retriever = HybridRetriever(vector_retriever=vec_store, graph_retriever=graph_store)

    vec_ms = benchmark_vector_search(vec_store)
    graph_ms = benchmark_graph_lookup(graph_store)
    hybrid_ms = benchmark_hybrid_retrieval(hybrid_retriever)

    print("-" * 60)
    print("BENCHMARK SUMMARY RESULTS:")
    print(f"  Vector Search Latency (FastEmbed+Qdrant) : {vec_ms:.2f} ms")
    print(f"  Graph Lookup Latency (Neo4j)              : {graph_ms:.2f} ms")
    print(f"  Hybrid Retrieval Latency (Combined)       : {hybrid_ms:.2f} ms")
    print("=" * 60)

    graph_store.close()


if __name__ == "__main__":
    main()
