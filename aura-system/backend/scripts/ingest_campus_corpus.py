"""
Campus Corpus Ingestion Script for University Pilot (AURA Auditor).
Reads university policy documents, handbooks, course catalogs, and academic calendars
(PDF, Markdown, TXT), splits them into semantic chunks, and indexes them into
Qdrant Vector Store and Knowledge Base under the 'academic' domain.

Usage:
  # Ingest default pre-packaged university starter corpus (Instant Demo):
  python -m app.scripts.ingest_campus_corpus --demo

  # Ingest a custom directory of campus PDFs/documents:
  python -m app.scripts.ingest_campus_corpus --dir /path/to/university/pdfs/
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any

from app.schemas.schemas import DocumentIngestRequest
from app.core.compliance_service import compliance_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AuraCampusIngest")


# Built-in High-Stakes University Policy Starter Corpus (Demo Ground Truth)
CAMPUS_DEMO_DOCUMENTS = [
    {
        "title": "2025-2026 Academic Calendar & Registration Deadlines",
        "domain": "academic",
        "source_trust_tier": 1,
        "content": (
            "Section 1: Fall Semester Key Deadlines.\n"
            "Classes begin on Monday, August 25, 2025. "
            "The official deadline to add or drop a course without academic penalty or a 'W' grade is Friday, September 12, 2025 at 5:00 PM EST.\n"
            "The final deadline to withdraw from a course with a grade of 'W' is Friday, October 31, 2025.\n"
            "Final examinations will take place between December 8, 2025 and December 13, 2025.\n\n"
            "Section 2: Spring Semester Key Deadlines.\n"
            "Spring classes commence on January 12, 2026. The add/drop deadline without penalty is January 26, 2026. "
            "Spring commencement ceremony is scheduled for May 16, 2026."
        )
    },
    {
        "title": "Undergraduate Computer Science Course Catalog & Degree Prerequisites",
        "domain": "academic",
        "source_trust_tier": 1,
        "content": (
            "CS 101: Introduction to Computer Science (4 credits). Prerequisite: None. Corequisite: MATH 115 (Calculus I).\n"
            "CS 201: Data Structures & Algorithms (4 credits). Prerequisite: CS 101 with a minimum grade of C, and MATH 115.\n"
            "CS 301: Systems Programming & Operating Systems (4 credits). Prerequisite: CS 201 with a minimum grade of C. "
            "CS 301 does NOT require Math 400 or Advanced Linear Algebra.\n"
            "CS 480: Senior Capstone Software Project (3 credits). Prerequisites: CS 301, senior standing (minimum 90 earned credits), and departmental approval.\n\n"
            "Graduation Requirements: A minimum of 120 total credit hours is required for the Bachelor of Science in Computer Science, "
            "with a cumulative GPA of at least 2.00 across all university coursework and 2.50 in major courses."
        )
    },
    {
        "title": "Student Code of Conduct & Academic Integrity Policy (Handbook §4.1)",
        "domain": "academic",
        "source_trust_tier": 1,
        "content": (
            "Section 4.1: Academic Integrity & Plagiarism Standards.\n"
            "All students must adhere to strict academic honesty. Plagiarism is defined as the intentional or unintentional "
            "use of another's words, ideas, data, or code without proper attribution and citation.\n"
            "Sanctions for a first-time academic dishonesty infraction include a grade penalty of F on the assignment or an F in the course, "
            "subject to the Dean's Academic Review Board.\n"
            "Repeated infractions will result in formal academic suspension for a minimum of two full academic semesters or permanent expulsion.\n\n"
            "Section 4.2: AI & Unauthorized Tool Usage.\n"
            "Generative AI tools (e.g. ChatGPT) may only be used when explicitly authorized in the instructor's written course syllabus. "
            "Unapproved submission of AI-generated content constitutes academic fraud under Section 4.1."
        )
    },
    {
        "title": "University Financial Aid & Merit Scholarship Retention Regulations",
        "domain": "academic",
        "source_trust_tier": 1,
        "content": (
            "Section 1: Presidential & Dean's Merit Scholarship Retention.\n"
            "Recipients of the Presidential Merit Scholarship must maintain full-time enrollment (minimum 12 credit hours per semester) "
            "and achieve a minimum cumulative GPA of 3.25 evaluated at the conclusion of each spring semester.\n"
            "Dean's Scholarship recipients must maintain a cumulative GPA of at least 3.00.\n\n"
            "Section 2: Satisfactory Academic Progress (SAP) for Federal Aid.\n"
            "To remain eligible for federal and state financial aid, undergraduate students must maintain a cumulative GPA of at least 2.00 "
            "and successfully complete at least 67% of all attempted cumulative credit hours."
        )
    }
]


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extracts plain text from a PDF file using pypdf, pdfplumber, or PyPDF2."""
    try:
        import pypdf
        reader = pypdf.PdfReader(str(pdf_path))
        text_parts = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(text_parts).strip()
    except ImportError:
        pass

    try:
        import pdfplumber
        with pdfplumber.open(str(pdf_path)) as pdf:
            text_parts = [page.extract_text() or "" for page in pdf.pages]
            return "\n\n".join(text_parts).strip()
    except ImportError:
        pass

    logger.warning(
        f"Neither 'pypdf' nor 'pdfplumber' is installed. "
        f"To ingest binary PDFs, install pypdf via: pip install pypdf"
    )
    return ""


def ingest_document(title: str, content: str, domain: str = "academic", trust_tier: int = 1) -> bool:
    """Ingests a single text document into the AURA compliance and knowledge store."""
    if not content or len(content.strip()) < 10:
        logger.warning(f"Skipping empty or tiny document: {title}")
        return False

    req = DocumentIngestRequest(
        title=title,
        domain=domain,
        content=content,
        source_trust_tier=trust_tier,
        metadata={"ingested_by": "campus_corpus_script"}
    )
    resp = compliance_service.ingest_document(req)
    logger.info(f"✅ Ingested: '{resp.title}' [{resp.doc_id}] ({resp.total_chunks} chunks)")
    return True


def ingest_directory(dir_path: Path, domain: str = "academic") -> int:
    """Recursively traverses a directory and ingests supported files (PDF, TXT, MD, CSV)."""
    if not dir_path.is_dir():
        logger.error(f"Directory not found: {dir_path}")
        return 0

    count = 0
    supported_extensions = {".pdf", ".txt", ".md", ".csv"}

    for file_path in dir_path.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
            title = file_path.stem.replace("_", " ").title()
            ext = file_path.suffix.lower()

            if ext == ".pdf":
                content = extract_text_from_pdf(file_path)
            else:
                try:
                    content = file_path.read_text(encoding="utf-8", errors="ignore")
                except Exception as e:
                    logger.error(f"Failed to read file {file_path}: {e}")
                    continue

            if content:
                if ingest_document(title=title, content=content, domain=domain):
                    count += 1

    return count


def main():
    parser = argparse.ArgumentParser(description="AURA Campus Document Corpus Ingestion Tool")
    parser.add_argument("--demo", action="store_true", help="Ingest pre-packaged university starter corpus")
    parser.add_argument("--dir", type=str, help="Directory containing campus PDFs, markdown, or text files")
    parser.add_argument("--file", type=str, help="Path to a single document to ingest")
    parser.add_argument("--domain", type=str, default="academic", help="Target domain (default: academic)")
    parser.add_argument("--tier", type=int, default=1, help="Source trust tier (1=Curated, 2=Secondary, 3=Unvetted)")

    args = parser.parse_args()

    logger.info("==================================================")
    logger.info("   AURA Campus Corpus Ingestion Engine (University Pilot)")
    logger.info("==================================================")

    total_ingested = 0

    if args.demo:
        logger.info(f"🚀 Ingesting {len(CAMPUS_DEMO_DOCUMENTS)} pre-packaged university starter documents...")
        for doc in CAMPUS_DEMO_DOCUMENTS:
            if ingest_document(
                title=doc["title"],
                content=doc["content"],
                domain=doc["domain"],
                trust_tier=doc["source_trust_tier"]
            ):
                total_ingested += 1

    elif args.file:
        fpath = Path(args.file)
        if not fpath.exists():
            logger.error(f"File does not exist: {fpath}")
            sys.exit(1)
        ext = fpath.suffix.lower()
        content = extract_text_from_pdf(fpath) if ext == ".pdf" else fpath.read_text(encoding="utf-8")
        if ingest_document(title=fpath.stem.title(), content=content, domain=args.domain, trust_tier=args.tier):
            total_ingested += 1

    elif args.dir:
        dpath = Path(args.dir)
        total_ingested = ingest_directory(dpath, domain=args.domain)

    else:
        logger.info("No flag provided. Ingesting default university demo corpus...")
        for doc in CAMPUS_DEMO_DOCUMENTS:
            if ingest_document(
                title=doc["title"],
                content=doc["content"],
                domain=doc["domain"],
                trust_tier=doc["source_trust_tier"]
            ):
                total_ingested += 1

    logger.info("==================================================")
    logger.info(f"🎉 Ingestion Complete! Total documents indexed: {total_ingested}")
    logger.info("The knowledge base is now ready to verify university claims.")
    logger.info("==================================================")


if __name__ == "__main__":
    main()
