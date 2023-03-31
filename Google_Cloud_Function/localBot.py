import os
from datetime import timedelta
from firebase_admin import credentials, db, initialize_app
from google.cloud import storage

# Initialize the Firebase Admin SDK
cred = credentials.Certificate('service-account.json')
initialize_app(cred, {
    'databaseURL': 'https://chat-bot-project-tr9v.firebaseio.com/'
})

def upload_videos(local_dir_path, storage_dir_name):
    # Check if the directory exists
    if not os.path.exists(local_dir_path) or not os.path.isdir(local_dir_path):
        print(f"Directory {local_dir_path} does not exist. Skipping upload.")
        return

    # Create a new bucket in Firebase Storage
    storage_client = storage.Client()
    bucket_name = "chat-bot-project-tr9v.appspot.com"
    bucket = storage_client.get_bucket(bucket_name)

    # Define the video directories to look for
    video_directories = ["5-f/", "4-f/"]
    total_files = 0
    success_count = 0
    path_map = {}
    video_usage = {}

    # Upload all videos in the directories to Firebase Storage
    for video_directory in video_directories:
        directory_path = os.path.join(local_dir_path, video_directory)

        # Check if the directory exists
        if not os.path.exists(directory_path) or not os.path.isdir(directory_path):
            print(
                f"Directory {directory_path} does not exist. Skipping upload.")
            continue

        # Upload all videos in the directory to Firebase Storage
        for file_name in os.listdir(directory_path):
            local_file_path = os.path.join(directory_path, file_name)

            # Check if the file is an mp4 video
            if not file_name.endswith('.mp4'):
                print(
                    f"File {file_name} is not an mp4 video. Skipping upload.")
                continue

            # Get the room names from the file name
            room_names = os.path.splitext(file_name)[0].split("+")

            # Upload the video to Firebase Storage for each room name
            for room_name in room_names:
                video_file_name = f"{storage_dir_name}/{room_name}/{file_name}"
                path_map[local_file_path] = video_file_name
                print(
                    f"\nUploading video {file_name} to {video_file_name} for room {room_name}...")

                # Upload the video to Firebase Storage
                blob = bucket.blob(video_file_name)
                blob.upload_from_filename(local_file_path, timeout=60)

                # Set the expiration time to 5 minutes
                video_url = blob.generate_signed_url(
                    expiration=timedelta(days=365))
                if len(video_url) > 70:
                    show_url = f"{video_url[:35]}...{video_url[-32:]}"
                    print(f"Generated signed URL for {video_file_name}: {show_url}")

                # Write the video URL to the Realtime Database
                room_ref = db.reference(f'{storage_dir_name}/' + room_name)
                room_ref.set({
                    'video_url': video_url
                })
                success_count += 1
                print(f"Updated database with video URL for room {room_name}.")

            total_files += 1

    num_paths = len(path_map)
    print(f"\n{success_count} out of {total_files} files uploaded successfully ({num_paths} unique paths).\n")

    # Print a table of local paths and their corresponding storage paths
    print("{:<4} {:<50} {:<50} {}".format(
        "No.", "Local Path", "Storage Path", "Video Usage"))
    print("-" * 119)

    # Count the number of times each room appears in a video
    for local_path, storage_path in path_map.items():
        # Get the room names from the file name
        file_name = os.path.basename(local_path)
        room_names = os.path.splitext(file_name)[0].split("+")

        for room_name in room_names:
            if room_name not in video_usage:
                video_usage[room_name] = []

            # Add the path to the video usage dictionary
            video_usage[room_name].append(storage_path)

    # Print the local paths and their corresponding storage paths
    for local_path, storage_path in path_map.items():
        storage_paths = storage_path.split(',')
        num_paths = len(storage_paths)


        for i in range(num_paths):
            video_count = len(video_usage.get(storage_paths[i], []))
            video_usage_str = f"{video_count} ({' '.join(video_usage.get(storage_paths[i], []))})"
            print("{:<4} {:<50} {:<50} {}".format(
                i+1, local_path, storage_paths[i], video_usage_str))


if __name__ == "__main__":
    # Example usage:
    upload_videos("../../VIDEO/video", "rooms")
