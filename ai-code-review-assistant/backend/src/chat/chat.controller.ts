import { Controller, Get, Post, Param, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'Chat session successfully created' })
  async createSession(@Body() createChatSessionDto: CreateChatSessionDto, @Request() req) {
    return this.chatService.createSession(createChatSessionDto, req.user.id);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for current user' })
  @ApiResponse({ status: 200, description: 'Chat sessions retrieved successfully' })
  async findAllSessions(@Request() req) {
    return this.chatService.findAllSessions(req.user.id);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a specific chat session' })
  @ApiResponse({ status: 200, description: 'Chat session retrieved successfully' })
  async findSession(@Param('id') id: string, @Request() req) {
    return this.chatService.findSession(id, req.user.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message in a chat session' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.createMessage(createMessageDto, req.user.id);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiResponse({ status: 200, description: 'Chat session successfully deleted' })
  async deleteSession(@Param('id') id: string, @Request() req) {
    return this.chatService.deleteSession(id, req.user.id);
  }
}
