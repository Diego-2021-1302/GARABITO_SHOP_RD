<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Get messages for the current user (Client side)
     */
    public function getUserMessages()
    {
        $messages = Message::where('user_id', Auth::id())
            ->with(['admin'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark as read when client views them
        Message::where('user_id', Auth::id())
            ->where('sender_type', 'admin')
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    /**
     * Send message as a user (Client side)
     */
    public function sendMessageAsUser(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $message = Message::create([
            'user_id' => Auth::id(),
            'content' => $request->content,
            'sender_type' => 'user',
            'is_read' => false,
        ]);

        return response()->json($message, 201);
    }

    /**
     * Get all conversations for Admin (Admin side)
     */
    public function getAdminConversations()
    {
        // Get unique users who have sent messages, with their last message
        $conversations = User::whereHas('messages')
            ->with(['messages' => function ($query) {
                $query->latest();
            }])
            ->get()
            ->map(function ($user) {
                $lastMessage = $user->messages->first();
                $unreadCount = $user->messages()
                    ->where('sender_type', 'user')
                    ->where('is_read', false)
                    ->count();

                return [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'last_message' => $lastMessage->content,
                    'last_message_time' => $lastMessage->created_at,
                    'unread_count' => $unreadCount,
                ];
            })
            ->sortByDesc('last_message_time')
            ->values();

        return response()->json($conversations);
    }

    /**
     * Get messages with a specific user for Admin
     */
    public function getAdminMessagesWithUser($userId)
    {
        $messages = Message::where('user_id', $userId)
            ->with(['user', 'admin'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark as read when admin views them
        Message::where('user_id', $userId)
            ->where('sender_type', 'user')
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    /**
     * Send message as Admin
     */
    public function sendMessageAsAdmin(Request $request, $userId)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $message = Message::create([
            'user_id' => $userId,
            'admin_id' => Auth::id(),
            'content' => $request->content,
            'sender_type' => 'admin',
            'is_read' => false,
        ]);

        return response()->json($message, 201);
    }
}
