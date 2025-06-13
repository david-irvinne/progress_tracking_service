from locust import HttpUser, task, between
import random
import uuid # Untuk menghasilkan userId yang lebih beragam

# Daftar User ID contoh untuk digunakan dalam tes
# Anda bisa memperluas atau membuat ini lebih dinamis jika perlu
USER_IDS_SAMPLE = [str(uuid.uuid4()) for _ in range(50)] # Membuat 50 ID unik
ACTIVITY_NAMES_SAMPLE = ["Grammar Intro", "Vocabulary Set A", "Speaking Practice Unit 1", "Listening Comprehension Test"]

class ProgressTrackingUser(HttpUser):
    wait_time = between(0.1, 0.9)  # Waktu tunggu antar request per user virtual
    
    # Host sudah termasuk base path API
    # Jadi, request akan menjadi host + "activityLog", host + "recommendation", dll.
    host = "https://pts.koyeb.app/api/progress" # Dihilangkan trailing slash untuk kejelasan, path di task akan diawali /

    def on_start(self):
        """
        Dipanggil saat user virtual dimulai.
        Kita bisa memilih userId acak untuk setiap user virtual di sini.
        """
        self.user_id = random.choice(USER_IDS_SAMPLE)

    @task(3) # Bobot 3: Lebih sering dijalankan
    def get_activity_logs_for_user(self):
        # Pilih userId secara acak dari sampel atau gunakan self.user_id
        # Menggunakan self.user_id akan membuat satu virtual user konsisten mengakses lognya sendiri
        # Menggunakan random.choice(USER_IDS_SAMPLE) akan membuat setiap request memilih user acak
        current_test_user_id = random.choice(USER_IDS_SAMPLE)
        
        # Path relatif terhadap host yang didefinisikan di atas
        # Jika host = "https://pts.koyeb.app/api/progress", maka path = "/activityLog/..."
        with self.client.get(f"/activityLog/{current_test_user_id}", catch_response=True, name="/activityLog/[userId]") as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list): # Respons yang diharapkan adalah list
                        response.success()
                    else:
                        response.failure(f"Get logs: Unexpected JSON response structure, not a list. Text: {response.text}")
                except ValueError: # response.json() gagal
                    response.failure(f"Get logs: Invalid JSON response. Text: {response.text}")
            elif response.status_code == 404: # Ini juga respons yang valid dari API
                response.success() # Tandai sebagai sukses karena API merespons dengan benar
            else:
                response.failure(f"Get logs: Unexpected status code: {response.status_code}. Text: {response.text}")

    @task(2) # Bobot 2
    def create_activity_log(self):
        payload = {
            "userId": self.user_id, # Menggunakan ID dari on_start agar satu user virtual membuat log untuk dirinya sendiri
            "activityName": random.choice(ACTIVITY_NAMES_SAMPLE),
            "activityDuration": random.randint(5, 120), # Durasi dalam menit
            "score": round(random.uniform(0, 100), 2), # Skor dengan 2 desimal
            "comment": f"Automated test comment for activity by {self.user_id}"
        }
        with self.client.post("/activityLog", json=payload, catch_response=True, name="/activityLog") as response:
            if response.status_code == 201:
                response.success()
            elif response.status_code == 400: # Bad request, misal field kurang
                response.failure(f"Create log: Bad request (400). Text: {response.text}")
            else:
                response.failure(f"Create log: Unexpected status code: {response.status_code}. Text: {response.text}")

    @task(1) # Bobot 1: Lebih jarang dijalankan
    def get_recommendation_for_user(self):
        current_test_user_id = random.choice(USER_IDS_SAMPLE)
        with self.client.get(f"/recommendation/{current_test_user_id}", catch_response=True, name="/recommendation/[userId]") as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Cek apakah field utama ada di respons
                    if "activityName" in data and "averageScore" in data:
                        response.success()
                    else:
                        response.failure(f"Get recommendation: Response missing expected fields. Text: {response.text}")
                except ValueError:
                    response.failure(f"Get recommendation: Invalid JSON response. Text: {response.text}")
            elif response.status_code == 404: # Respons valid jika tidak ada data untuk rekomendasi
                response.success()
            else:
                response.failure(f"Get recommendation: Unexpected status code: {response.status_code}. Text: {response.text}")