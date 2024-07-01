I'm excited to share my recent project where I developed a comprehensive microservices-based system for a music streaming platform. This project consists of four key microservices: ytm-gateway, ytm-library, ytm-resource, and ytm-stream. Each microservice has a distinct role, and together they provide a scalable, efficient, and secure solution for handling various functionalities of the platform.

**Technologies Used:**

- **Backend:** Node.js, Koa.js
- **Inter-service Communication:** gRPC, Kafka
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Microservices Overview:**

1. **ytm-gateway:**
    - **Role:** Acts as the entry point for all client requests.
    - **Functionality:** Handles user authentication using JWT, routes requests to other microservices, and manages service registration.
    - **Implementation:**
        - Integrated Koa.js to manage HTTP requests.
        - Configured JWT for secure authentication.
        - Established routes for user login and registration, forwarding authenticated requests to the respective services.
        - Utilized Kafka for message production and consumption to ensure decoupled communication.
2. **ytm-library:**
    - **Role:** Manages metadata and library information for tracks, albums, and playlists.
    - **Functionality:** Handles metadata extraction, library initialization, and dynamic loading of media files.
    - **Implementation:**
        - Used mongoose to interact with MongoDB for storing metadata.
        - Implemented gRPC server to provide metadata services.
        - Employed worker threads and mutexes for concurrent processing of metadata, enhancing performance.
        - Registered the service with ytm-gateway for dynamic discovery.
3. **ytm-resource:**
    - **Role:** Manages user information and provides CRUD operations for tracks, albums, and playlists.
    - **Functionality:** Handles user authentication, password hashing, and resource management.
    - **Implementation:**
        - Developed RESTful APIs using Koa.js for managing resources.
        - Implemented JWT authentication middleware to protect sensitive endpoints.
        - Used bcrypt for secure password hashing and verification.
        - Registered the service with ytm-gateway for dynamic discovery.
        - Used Kafka for inter-service communication and event-driven updates.
4. **ytm-stream:**
    - **Role:** Handles streaming of audio files to the clients.
    - **Functionality:** Provides secure and efficient audio streaming based on user subscription status.
    - **Implementation:**
        - Developed streaming functionality using Koa.js and Node.js streams.
        - Verified user subscription status using JWT before allowing access to audio streams.
        - Implemented gRPC server for streaming-related services.
        - Registered the service with ytm-gateway for dynamic discovery.
        - Used Kafka for messaging and event handling.
