from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.cloud import storage
from lightrag import LightRAG, QueryParam
from lightrag.llm import gpt_4o_mini_complete
from fastapi.responses import StreamingResponse

from typing import AsyncGenerator

import nest_asyncio
import openai
import os
import gc

# Configure API Key
os.environ["OPENAI_API_KEY"] = "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"


RAG_BASE_DIR = "/home/yusuf/rag_folders"

# Initialize FastAPI app
app = FastAPI()

class QuestionRequest(BaseModel):
    question: str

class ResponseModel(BaseModel):
    question: str
    consultations: dict
    final_response: str

# GPT-4 Mini Response Function
def get_gpt_response(messages):
    response = openai.chat.completions.create(
        temperature=0.1,
        top_p=0.9,
        model="gpt-4o-mini",
        #model="gpt-4o",
        messages=messages,
        max_tokens=1200,
        timeout = 400
    )
    return response.choices[0].message.content.strip()

# Validate specialties
VALID_SPECIALTIES = {
    "Pathology", "Hematology", "Allergy Immunology", "Audiology", "Cardiology",
    "Critical Care", "Dentistry", "Dermatology", "Elderly Care", "Emergency",
    "Endocrinology", "Epidemiology", "Ethics", "Fitness Sports", "Gastroenterology",
    "General Surgery", "Genetics", "Head Neck Surgery", "Health AI", "Health Economics",
    "Health Education", "Health Entrepreneurship", "Hospital Management",
    "Infectious Diseases", "Internal Medicine", "Lab Medicine", "Mental Health",
    "Neurology", "Neuroscience", "Nutrition", "Obstetrics Gynecology", "Oncology",
    "Ophthalmology", "Orthopedics", "Palliative Care", "Pediatric Surgery",
    "Pediatrics", "Pharmacy", "Physical Medicine and Rehabilitation",
    "Preventive Medicine", "Psychiatry", "Public Health", "Pulmonology",
    "Radiology", "Rare Diseases", "Rheumatology", "Sleep", "Social Media Addiction",
    "Supplements", "Vaccination", "Wearables", "Wellbeing", "Work Health"
}

def process_question(question):
    print(f"Processing question: {question}")
    messages = [
        {"role": "system", "content": f"You are health consultant selector. I will give you the question, and you will select which specialties or expertise could be related to this question. Min 1 max 4 specialities, select just relevant ones. Just list specialties with a comma, and don't list any specialties not in this list. Here are all specialties: {VALID_SPECIALTIES}"},
        {"role": "user", "content": question},
    ]
    response = get_gpt_response(messages)
    print(f"GPT Response for specialties: {response}")
    return [specialty.strip() for specialty in response.split(",") if specialty.strip() in VALID_SPECIALTIES]


# Dictionary to store LightRAG instances for each specialty
rag_instances = {}

# Function to initialize and store RAG for a specialty
def initialize_rag(specialty):
    print(f"Initializing RAG for specialty: {specialty}")
    try:
        if specialty not in rag_instances:
            local_path = os.path.join(RAG_BASE_DIR, specialty)
            if not os.path.exists(local_path):
                raise FileNotFoundError(f"Directory for {specialty} not found in {RAG_BASE_DIR}")
            
            # Create and store the LightRAG instance
            rag_instances[specialty] = LightRAG(
                working_dir=local_path,
                llm_model_func=gpt_4o_mini_complete
            )
            print(f"Initialized RAG for {specialty}")
        else:
            print(f"RAG for {specialty} already initialized")
        return rag_instances[specialty]
    except Exception as e:
        print(f"Error initializing RAG for {specialty}: {e}")
        return None

# Async generator to stream responses
async def stream_consultations(question: str) -> AsyncGenerator[str, None]:
    # Step 1: Process the question to determine relevant specialties
    yield "Processing the question to determine specialties...\n"
    modules = process_question(question)
    print(f"Specialties determined: {modules}")
    yield f"Specialties determined: {', '.join(modules)}\n"

    # Step 2: Get consultations from each specialty
    specialty_responses = {}
    for specialty in modules:
        try:
            yield f"Processing consultation for {specialty}...\n"
            rag = initialize_rag(specialty)
            if not rag:
                error_message = f"Error: Failed to initialize RAG for {specialty}\n"
                yield error_message
                continue

            # Query LightRAG for the consultation
            nest_asyncio.apply()
            reply = rag.query(
                question,
                param=QueryParam(
                    mode="naive",
                    response_type=f"You are a helpful {specialty} specialist. Provide a detailed consultation by considering {specialty}-specific guidelines, common diagnostic criteria, and treatment options that giving you as medical literature. Provide a consultation with step-by-step reasoning."
                )
            )
            specialty_responses[specialty] = reply
            print(f"{specialty} consultation: {reply}")
            yield f"{specialty} consultation: {reply}\n"

        except Exception as e:
            error_message = f"Error processing {specialty}: {str(e)}"
            specialty_responses[specialty] = error_message
            yield f"{error_message}\n"

    # Step 3: Combine results into a final response
    yield "Compiling final response...\n"
    final_messages = [
        {
            "role": "system",
            "content": (
                "You are a health consultant tasked with synthesizing inputs from multiple specialists. "
                "Consider the question and the consultation notes provided, evaluate the information critically, "
                "and deliver a well-reasoned decision along with actionable suggestions."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Question: {question}\n\n"
                f"Consultation Notes:\n"
                f"{', '.join([f'{specialty}: {response}' for specialty, response in specialty_responses.items()])}"
            ),
        },
    ]
    final_response = get_gpt_response(final_messages)
    print(f"Final response: {final_response}")
    yield f"Final Response: {final_response}\n"

# API Endpoint
@app.post("/consultation", response_model=None)
async def get_consultation(data: QuestionRequest):
    question = data.question
    return StreamingResponse(
        stream_consultations(question),
        media_type="text/plain"
    )