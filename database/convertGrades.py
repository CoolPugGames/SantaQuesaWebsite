import csv
import json
def process_student_data(input_csv, output_csv):
    with open(input_csv, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        data = []
        for row in reader:
            student_id = row['StudentID']
            class_grade_pairs = {}
            for i in range(1, 5):  # Assuming Class1 to Class4 and Grade1 to Grade4
                class_name = row[f'Class{i}']
                grade = row[f'Grade{i}']
                if class_name and grade:  # Ignore empty class/grade entries
                    class_grade_pairs[class_name] = grade
            data.append({'StudentID': student_id, 'ClassesAndGrades': class_grade_pairs})
    
    with open(output_csv, 'w', newline='') as outfile:
        fieldnames = ['StudentID', 'ClassesAndGrades']
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        for student in data:
            writer.writerow(student)

input_file = 'output_student_data_new.csv'
output_file = 'formatted_student_data.csv'
process_student_data(input_file, output_file)
