import streamlit as st
import google.generativeai as genai

# Page configuration
st.set_page_config(page_title="Gemini Chat", page_icon="🤖", layout="centered")

# Title
st.title("💬 Gemini Chat App")

# Sidebar for API key
with st.sidebar:
    st.header("Configuration")
    api_key = st.text_input("Enter your Gemini API Key", type="password")
    st.markdown("[Get an API key](https://makersuite.google.com/app/apikey)")
    st.markdown("---")
    st.markdown("### About")
    st.markdown("A simple chat interface for Google's Gemini AI model.")

# Initialize session state for chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("What would you like to know?"):
    if not api_key:
        st.error("Please enter your Gemini API key in the sidebar.")
    else:
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get Gemini response
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-3-flash-preview')
            
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    response = model.generate_content(prompt)
                    st.markdown(response.text)
            
            # Add assistant response to chat history
            st.session_state.messages.append({"role": "assistant", "content": response.text})
            
        except Exception as e:
            st.error(f"Error: {str(e)}")

# Clear chat button
if st.sidebar.button("Clear Chat History"):
    st.session_state.messages = []
    st.rerun()