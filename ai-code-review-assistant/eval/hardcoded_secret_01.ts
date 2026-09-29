class DatabaseConfig {
    // Hardcoded database credentials
    private dbHost = "localhost";
    private dbUser = "admin";
    private dbPassword = "SuperSecret123!";  // Should be in environment variables
    private dbName = "production";

    getConnection() {
        return {
            host: this.dbHost,
            user: this.dbUser,
            password: this.dbPassword,
            database: this.dbName
        };
    }
}

// Another hardcoded secret
const AWS_ACCESS_KEY_ID = "AKIAI44QH8DHBEXAMPLE";
const AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
