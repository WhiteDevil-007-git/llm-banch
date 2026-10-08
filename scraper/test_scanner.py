"""
Test script for the hardware scanner. 
Simulates the scanner without self-deleting or opening the browser.
"""

def test_scan():
    """Tests hardware scanning and backend connection without side effects."""
    print("Testing hardware detection...")
    
    # Test GPU detection
    gpu = get_gpu_info()
    print(f"GPU detected: {gpu['gpu_name']} - {gpu['vram_gb']}GB VRAM")
    
    # Test system detection
    sys = get_system_info()
    print(f"RAM: {sys['ram_gb']}GB")
    print(f"CPU: {sys['cpu_name']} ({sys['cpu_cores']} cores)")
    print(f"OS: {sys['os']}")
    
    # Test backend connection
    hardware_data = {**gpu, **sys}
    print()
    print("Testing backend connection...")
    token = send_to_backend(hardware_data)
    
    if token:
        print(f"✅ Backend connected! Token: {token}")
        print(f"✅ Full scan URL: http://localhost:5173/scan-result?token={token}")
    else:
        print("❌ Backend not reachable")

if __name__ == "__main__":
    # Import scanner functions
    from scanner import get_gpu_info, get_system_info, send_to_backend
    test_scan()
