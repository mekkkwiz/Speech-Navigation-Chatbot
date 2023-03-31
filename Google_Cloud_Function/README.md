# Firebase Video Uploader

This program uploads all mp4 videos in the specified local directory to Firebase Storage and adds their URLs to the Firebase Realtime Database.

## Installation

  1. Install the required packages:

      ```bash
      pip install -r requirements.txt
      ```

  2. Download the Firebase service account key and save it as `service-account.json` in the root directory of the project.

  3. Create a Firebase Storage bucket and note its name.

  4. Set up Firebase Realtime Database with a structure like this:

      ```json
      {
          "testBot": {
              "room1": {
                  "video_url": "https://example.com/video.mp4"
              },
              "room2": {
                  "video_url": "https://example.com/video.mp4"
              }
          }
      }
      ```

      Replace `testBot` with the name of your Firebase Storage directory.

## Usage

  To upload videos, run:

  For example, if your local video directory is located at `/home/user/Videos` and you want to store the videos in Firebase Storage under the directory name `rooms`, you would edit the code like this:

  ```python
  if __name__ == "__main__":
    # Example usage:
    upload_videos("/home/user/Videos", "rooms")
  ```

  then run:

  ```bash
  python main.py
  ```
