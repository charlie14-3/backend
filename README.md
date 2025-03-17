📩 Contact & Inquiries
Method	Endpoint	Description
POST	/contact	Submit a contact/inquiry form



🧵 Forum (Discussion Board)
Method	Endpoint	Description
GET	/forum	Fetch all threads (sorted by latest/upvotes/downvotes)
POST	/forum	Create a new thread (supports image uploads)
DELETE	/forum/:id	Delete a thread (only by the creator)
Replies
Method	Endpoint	Description
POST	/forum/:id/reply	Add a reply to a thread
DELETE	/forum/:threadId/reply/:replyId/:name	Delete a reply (only by the author)
Votes
Method	Endpoint	Description
POST	/forum/:id/upvote	Upvote a thread
POST	/forum/:id/downvote	Downvote a thread
Reports
Method	Endpoint	Description
POST	/forum/:id/report	Report a thread for moderation
Polls
Method	Endpoint	Description
POST	/forum/:id/poll	Create a poll in a thread
POST	/forum/:id/poll/vote	Vote in a poll
Tags
Method	Endpoint	Description
GET	/forum/tags	Fetch all available tags
GET	/forum/tag/:tagName	Fetch threads under a specific tag


💬 Chat Feature
Method	Endpoint	Description
POST	/chat/send	Send a new chat message
GET	/chat/messages/:room	Fetch messages in a chat room
POST	/chat/create-room	Create a new chat room
GET	/chat/rooms	Fetch all active chat rooms
Uses Socket.io for real-time messaging.
Chats are stored in MongoDB for history retrieval.


 User Profiles
Method	Endpoint	Description
GET	/profile/:userId	Fetch user profile data
PUT	/profile/update/:userId	Update user profile
POST	/profile/upload	Upload/update profile picture
User authentication is handled via Firebase Auth.
Users can update their bio, profile picture, and other details.

Alumni Directory
Method	Endpoint	Description
GET	/alumni	Fetch all alumni profiles
GET	/alumni/:id	Fetch a specific alumni profile
POST	/alumni	Add a new alumni profile (Admin only)
Displays verified alumni with professional details.
Only admins can add new alumni.
