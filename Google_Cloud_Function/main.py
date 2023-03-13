from datetime import timedelta
from firebase_admin import credentials, db, initialize_app
from google.cloud import storage

# Initialize the Firebase Admin SDK
cred = credentials.Certificate('service-account.json')
initialize_app(cred, {
    'databaseURL': 'https://chat-bot-project-tr9v.firebaseio.com/'
})

def process_video(event, context):
    # Check if the content type is video
    content_type = event['contentType']
    if not content_type.startswith('video/'):
        print(f"Content type {content_type} is not a video. Skipping processing.")
        return

    # Get the file name and the room name from the event
    file_name = event['name']
    room_name = file_name.split('/')[1]

    # Get the video URL
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(event['bucket'])
    blob = bucket.blob(file_name)
    # Set the expiration time to 5 minutes
    video_url = blob.generate_signed_url(expiration=timedelta(days=365))

    # Write the video URL to the Realtime Database
    room_ref = db.reference('rooms/' + room_name)
    room_ref.set({
        'video_url': video_url
    })


#! for test only
# process_video({
#     "bucket": "chat-bot-project-tr9v.appspot.com",
#     "contentType": "video/mp4",
#     "name": "rooms/518/videos/516.mp4",
#     "timeCreated": "2022-03-14T12:34:56.789Z",
#     "updated": "2022-03-14T12:34:56.789Z"
# }, None)
