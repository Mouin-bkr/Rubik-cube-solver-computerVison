import sys
import kociemba

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("ERROR: No cube state provided")
        sys.exit(1)
    cube_state = sys.argv[1]
    try:
        solution = kociemba.solve(cube_state)
        print(solution)
    except Exception as e:
        print(f"ERROR: {e}")