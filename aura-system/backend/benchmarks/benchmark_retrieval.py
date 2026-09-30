"""
Retrieval Latency Benchmark Script for AURA (Dev 2 Day 5 Baseline Measurement).
Measures average, p50 (median), and p95 execution latency (ms) across Vector (Qdrant), Graph (Neo4j), and Hybrid retrieval.
"""

import time
import logging
import statistics
from typing import List, Dict, Any
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


def calculate_stats(latencies: List[float]) -> Dict[str, float]:
    """Calculate mean, p50 (median), and p95 latency in ms."""
    if not latencies:
        return {"mean": 0.0, "p50": 0.0, "p95": 0.0}
    sorted_lat = sorted(latencies)
    mean_val = statistics.mean(sorted_lat)
    p50_val = statistics.median(sorted_lat)
    p95_idx = max(0, int(len(sorted_lat) * 0.95) - 1)
    p95_val = sorted_lat[p95_idx]
    return {"mean": round(mean_val, 2), "p50": round(p50_val, 2), "p95": round(p95_val, 2)}


def benchmark_vector_search(vector_store: VectorRetriever, runs: int = 5) -> Dict[str, Any]:
    logger.info("Benchmarking Vector Search (FastEmbed + Qdrant)...")
    latencies = []
    per_query = {q: [] for q in SAMPLE_QUERIES}
    for _ in range(runs):
        for q in SAMPLE_QUERIES:
            t0 = time.perf_counter()
            _ = vector_store.semantic_search(query=q, top_k=5, min_similarity=0.5)
            t1 = time.perf_counter()
            dur = (t1 - t0) * 1000.0
            latencies.append(dur)
            per_query[q].append(dur)
    stats = calculate_stats(latencies)
    stats["per_query"] = {q: calculate_stats(lats) for q, lats in per_query.items()}
    logger.info(f"Vector Search Latency: mean={stats['mean']}ms, p50={stats['p50']}ms, p95={stats['p95']}ms")
    return stats


def benchmark_graph_lookup(graph_store: GraphRetriever, runs: int = 5) -> Dict[str, Any]:
    logger.info("Benchmarking Graph Lookup (Neo4j)...")
    latencies = []
    entities = ["AURA", "LangGraph", "FastAPI"]
    for _ in range(runs):
        t0 = time.perf_counter()
        _ = graph_store.graph_lookup(entities=entities)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000.0)
    stats = calculate_stats(latencies)
    logger.info(f"Graph Lookup Latency: mean={stats['mean']}ms, p50={stats['p50']}ms, p95={stats['p95']}ms")
    return stats


def benchmark_hybrid_retrieval(hybrid_retriever: HybridRetriever, runs: int = 5) -> Dict[str, Any]:
    logger.info("Benchmarking Hybrid Retrieval...")
    latencies = []
    per_query = {q: [] for q in SAMPLE_QUERIES}
    for _ in range(runs):
        for q in SAMPLE_QUERIES:
            t0 = time.perf_counter()
            _ = hybrid_retriever.retrieve(query_text=q)
            t1 = time.perf_counter()
            dur = (t1 - t0) * 1000.0
            latencies.append(dur)
            per_query[q].append(dur)
    stats = calculate_stats(latencies)
    stats["per_query"] = {q: calculate_stats(lats) for q, lats in per_query.items()}
    logger.info(f"Hybrid Retrieval Latency: mean={stats['mean']}ms, p50={stats['p50']}ms, p95={stats['p95']}ms")
    return stats


def main():
    print("=" * 70)
    print("AURA RETRIEVAL LATENCY BENCHMARK (DEV 2 DAY 5 BASELINE MEASUREMENT)")
    print("=" * 70)

    vec_store = VectorRetriever()
    graph_store = GraphRetriever()
    hybrid_retriever = HybridRetriever(vector_retriever=vec_store, graph_retriever=graph_store)

    vec_stats = benchmark_vector_search(vec_store)
    graph_stats = benchmark_graph_lookup(graph_store)
    hybrid_stats = benchmark_hybrid_retrieval(hybrid_retriever)

    print("-" * 70)
    print("BENCHMARK LATENCY SUMMARY (ms):")
    print(f"{'Retrieval Engine':<25} | {'Mean (ms)':<10} | {'p50 (ms)':<10} | {'p95 (ms)':<10}")
    print("-" * 70)
    print(f"{'Vector Search (FastEmbed)':<25} | {vec_stats['mean']:<10} | {vec_stats['p50']:<10} | {vec_stats['p95']:<10}")
    print(f"{'Graph Lookup (Neo4j)':<25} | {graph_stats['mean']:<10} | {graph_stats['p50']:<10} | {graph_stats['p95']:<10}")
    print(f"{'Hybrid Retrieval (Combined)':<25} | {hybrid_stats['mean']:<10} | {hybrid_stats['p50']:<10} | {hybrid_stats['p95']:<10}")
    print("=" * 70)

    print("\nPER-QUERY LATENCY BREAKDOWN (Hybrid Retrieval):")
    for q, qstats in hybrid_stats["per_query"].items():
        print(f"  Query: \"{q[:45]}...\"")
        print(f"    mean={qstats['mean']}ms | p50={qstats['p50']}ms | p95={qstats['p95']}ms")

    graph_store.close()


if __name__ == "__main__":
    main()

