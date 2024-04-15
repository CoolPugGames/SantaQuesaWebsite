import csv
import hashlib

# Function to hash a password
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Function to read the CSV file, hash passwords, and save to a new CSV file
def hash_passwords(input_file, output_file):
    with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        for row in reader:
            username = row[0]
            userid = row[1]
            password = row[2]
            hashed_password = hash_password(password)
            writer.writerow([username, userid, hashed_password])

# Example usage
input_file = 'database/user_passwords.csv'
output_file = 'database/user_passwords_hashed.csv'
hash_passwords(input_file, output_file)
print('Passwords hashed and saved to', output_file)
