#AUTHOR: Devsecure Innovations

import os
import json
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from slowapi import Limiter , _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address


limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="BPIE - Bharat Phishing Intelligence Engine")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# this key is hardcoded for development purposes only.
GENAI_API_KEY = "AIzaSyDDnUv9L_lNhTGlgDjOgB57SZAPvon2ztU" # Replace with your actual API key in production and secure it properly.
genai.configure(api_key=GENAI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

# data models [ android app -> send to this endpoint ]
class ScanRequest(BaseModel):
    text: str          # the scraped text from SMS or Accessibility Service
    context: str       # e.g., "WhatsApp", "UPI_SCREEN", "INCOMING_CALL"
    sender: Optional[str] = "Unknown" # Phone number or Sender ID

# logic stuffs
@app.post("/scan")
async def scan_for_scams(request: ScanRequest):
    try:
        # basic prompt 
        prompt = f"""
        You are a Cybersecurity Expert specializing in Indian Fraud Patterns.
        Analyze the following mobile data:
        
        SENDER: {request.sender}
        CONTEXT: {request.context}
        CONTENT: "{request.text}"
        
        Identify if this is a scam (Digital Arrest, UPI PIN Confusion, Task Fraud, KYC Phishing).
        
        Return ONLY a JSON object with this exact structure:
        {{
          "scam_detected": boolean,
          "risk_score": int (0-100),
          "threat_type": "string or None",
          "action": "RED" | "YELLOW" | "GREEN",
          "warning_message_en": "Short English warning",
          "warning_message_bn": "Short Bengali warning",
          "warning_message_hi": "Short Hindi warning"
        }}
        """

        
        response = model.generate_content(prompt)
        
        
        raw_text = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(raw_text)
        
        return result

    except Exception as e:
        
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"status": "BPIE Online"}

@app.get("/limited_endpoint", dependencies=[Depends(limiter.limit("5/minute"))])
async def limited_endpoint(request: Request):
    """
    This endpoint is limited to 5 requests per minute per IP address.
    """
    return {"message": "This endpoint is limited."}
