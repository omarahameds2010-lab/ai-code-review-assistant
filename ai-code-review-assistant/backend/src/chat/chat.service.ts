import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message, MessageRole } from './entities/message.entity';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { FilesService } from '../files/files.service';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionsRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private aiProvidersService: AiProvidersService,
    private filesService: FilesService,
  ) {}

  async createSession(createChatSessionDto: CreateChatSessionDto, userId: string) {
    const session = this.chatSessionsRepository.create({
      ...createChatSessionDto,
      userId,
    });
    return this.chatSessionsRepository.save(session);
  }

  async findAllSessions(userId: string) {
    return this.chatSessionsRepository.find({
      where: { userId },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSession(id: string, userId: string) {
    const session = await this.chatSessionsRepository.findOne({
      where: { id, userId },
      relations: ['messages'],
    });
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    return session;
  }

  async createMessage(createMessageDto: CreateMessageDto, userId: string) {
    const { sessionId, role, content } = createMessageDto;

    // Verify session belongs to user
    const session = await this.findSession(sessionId, userId);

    // Create user message
    const userMessage = this.messagesRepository.create({
      sessionId,
      role: MessageRole.USER,
      content,
    });
    await this.messagesRepository.save(userMessage);

    // If user message, generate AI response
    if (role === MessageRole.USER) {
      const aiResponse = await this.generateAIResponse(sessionId, content, session.contextFileIds, userId);
      
      const assistantMessage = this.messagesRepository.create({
        sessionId,
        role: MessageRole.ASSISTANT,
        content: aiResponse,
      });
      await this.messagesRepository.save(assistantMessage);

      return {
        userMessage,
        assistantMessage,
      };
    }

    return { userMessage };
  }

  private async generateAIResponse(sessionId: string, userQuery: string, contextFileIds: string[], userId: string) {
    try {
      // Get default AI provider
      const aiProvider = await this.aiProvidersService.getDefault(userId);
      if (!aiProvider) {
        throw new NotFoundException('No default AI provider configured');
      }

      // Get context files
      let context = '';
      if (contextFileIds && contextFileIds.length > 0) {
        const files = await Promise.all(
          contextFileIds.map(id => this.filesService.findOne(id, null)),
        );
        
        context = '\n\nCode Context:\n';
        files.forEach(file => {
          context += `\nFile: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`;
        });
      }

      // Get conversation history
      const session = await this.findSession(sessionId, userId);
      const messages = session.messages.slice(-10); // Last 10 messages for context

      const openai = new OpenAI({
        apiKey: aiProvider.apiKey,
        baseURL: aiProvider.baseUrl,
      });

      const apiMessages: any[] = [
        {
          role: 'system',
          content: `You are a helpful coding assistant. Answer questions about the provided code context. Be specific and reference file names and line numbers when possible. If you don't know the answer based on the context, say so clearly.${context}`,
        },
      ];

      // Add conversation history (excluding the current user message)
      for (const msg of messages) {
        apiMessages.push({
          role: msg.role === MessageRole.USER ? 'user' : 'assistant',
          content: msg.content,
        });
      }

      // Add current user query
      apiMessages.push({
        role: 'user',
        content: userQuery,
      });

      const response = await openai.chat.completions.create({
        model: aiProvider.modelName,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Chat Error:', error);
      return 'I apologize, but I encountered an error generating a response. Please check your AI provider configuration and try again.';
    }
  }

  async deleteSession(id: string, userId: string) {
    const session = await this.findSession(id, userId);
    
    // Delete associated messages
    await this.messagesRepository.delete({ sessionId: id });
    
    return this.chatSessionsRepository.remove(session);
  }
}
