/**
 * WordPress REST API client implementing CmsClient for pages, posts, taxonomies,
 * menus, authors and media. Composes modular per-concern services and supports
 * self-hosted and WordPress.com, with an optional fallback client.
 * Anatomy: docs → product-guide/cms-content/technical
 */
import {
  type BlogCategory,
  type CmsClient,
  type CmsMenuItem,
  type ContentAuthor,
  type Page,
  type Post
} from '../../types'

import { AuthorsService } from './authors'
import { CustomPostsService, type CustomPostType } from './customPosts'
import { MediaService } from './media'
import { MenusService } from './menus'
import { PagesService } from './pages'
import { PostsService } from './posts'
import { TaxonomiesService } from './taxonomies'
import { type WordPressConfig, type WpMediaItem } from './types'

/**
 * WordPress REST API client for fetching content
 * Supports both self-hosted WordPress and WordPress.com
 *
 * Modular architecture with separate services for:
 * - Pages
 * - Posts
 * - Taxonomies (Categories & Tags)
 * - Menus
 * - Authors
 */
class WordPressClient implements CmsClient {
  name = 'wordpress'
  private config: WordPressConfig
  private fallbackClient?: CmsClient

  // Service modules
  private pagesService: PagesService
  private postsService: PostsService
  private customPostsService: CustomPostsService
  private taxonomiesService: TaxonomiesService
  private menusService: MenusService
  private authorsService: AuthorsService
  private mediaService: MediaService

  constructor(
    baseUrl: string,
    apiKey?: string,
    fallbackClient?: CmsClient,
    applicationName?: string,
    revalidate: number = 3600
  ) {
    this.config = {
      baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
      apiKey,
      applicationName,
      wordPressComHost: baseUrl.includes('wordpress.com'),
      revalidate
    }
    this.fallbackClient = fallbackClient

    // Initialize services
    this.taxonomiesService = new TaxonomiesService(this.config)
    this.mediaService = new MediaService(this.config)
    this.pagesService = new PagesService(this.config, fallbackClient)
    this.postsService = new PostsService(this.config, this.taxonomiesService)
    this.customPostsService = new CustomPostsService(this.config)
    this.menusService = new MenusService(this.config)
    this.authorsService = new AuthorsService(this.config)
  }

  // Pages API
  async getPage(slug: string): Promise<Page | null> {
    return this.pagesService.getPage(slug)
  }

  async getPages(): Promise<Page[]> {
    return this.pagesService.getPages()
  }

  async getPagePaths(): Promise<string[]> {
    return this.pagesService.getPagePaths()
  }

  // Posts API
  async getPost(slug: string): Promise<Post | null> {
    return this.postsService.getPost(slug)
  }

  async getPosts(options?: {
    limit?: number
    offset?: number
    category?: string
    tag?: string
    author?: string | number
  }): Promise<Post[]> {
    return this.postsService.getPosts(options)
  }

  async getTotalPosts(options?: {
    category?: string
    tag?: string
  }): Promise<number> {
    return this.postsService.getTotalPosts(options)
  }

  async getRelatedPosts(
    post: Post,
    options?: { poolSize?: number }
  ): Promise<Post[]> {
    return this.postsService.getRelatedPosts(post, options)
  }

  async getPostPaths(): Promise<string[]> {
    return this.postsService.getPostPaths()
  }

  async getPostsByCategory(
    categoryId: string,
    options: { limit?: number; page?: number } = {}
  ) {
    return this.postsService.getPostsByCategory(categoryId, options)
  }

  async getPostsByTag(
    tagId: string,
    options: { limit?: number; page?: number } = {}
  ) {
    return this.postsService.getPostsByTag(tagId, options)
  }

  async searchPosts(search: string, options: { limit?: number } = {}) {
    return this.postsService.searchPosts(search, options)
  }

  async getPostsByAuthor(
    authorId: string,
    options: { limit?: number } = {}
  ): Promise<Post[]> {
    return this.postsService.getPostsByAuthor(authorId, options)
  }

  // Custom Post Types API
  async getCustomPost(
    postType: CustomPostType,
    slug: string
  ): Promise<Post | null> {
    return this.customPostsService.getCustomPost(postType, slug)
  }

  async getCustomPosts(
    postType: CustomPostType,
    options?: {
      limit?: number
      offset?: number
      category?: string
      tag?: string
      author?: string | number
    }
  ): Promise<Post[]> {
    return this.customPostsService.getCustomPosts(postType, options)
  }

  async getTotalCustomPosts(
    postType: CustomPostType,
    options?: {
      category?: string
      tag?: string
    }
  ): Promise<number> {
    return this.customPostsService.getTotalCustomPosts(postType, options)
  }

  async searchCustomPosts(
    postType: CustomPostType,
    search: string,
    options: { limit?: number } = {}
  ): Promise<Post[]> {
    return this.customPostsService.searchCustomPosts(postType, search, options)
  }

  async getCustomPostsByAuthor(
    postType: CustomPostType,
    authorId: string,
    options: { limit?: number } = {}
  ): Promise<Post[]> {
    return this.customPostsService.getCustomPostsByAuthor(
      postType,
      authorId,
      options
    )
  }

  // Taxonomies API
  async getCategories(): Promise<BlogCategory[]> {
    return this.taxonomiesService.getCategories()
  }

  async getTags() {
    return this.taxonomiesService.getTags()
  }

  async getCategoryPath(slug: string): Promise<BlogCategory[]> {
    return this.taxonomiesService.getCategoryPath(slug)
  }

  async getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    return this.taxonomiesService.getCategoryBySlug(
      slug
    ) as Promise<BlogCategory | null>
  }

  async getCategoryById(id: number): Promise<unknown | null> {
    return this.taxonomiesService.getCategoryById(id)
  }

  async getCategoriesByIds(ids: number[]): Promise<unknown[]> {
    return this.taxonomiesService.getCategoriesByIds(ids)
  }

  async getAllCategories(params?: Record<string, string>): Promise<unknown[]> {
    return this.taxonomiesService.getAllCategories(params ?? {})
  }

  // Menus API
  async getMenu(location: string): Promise<CmsMenuItem[]> {
    return this.menusService.getMenu(location)
  }

  async getMenuById(menuId: number): Promise<CmsMenuItem[]> {
    return this.menusService.getMenuById(menuId)
  }

  async getMenuBySlug(slug: string): Promise<CmsMenuItem[]> {
    return this.menusService.getMenuBySlug(slug)
  }

  async getMenuSlugs(): Promise<string[]> {
    return this.menusService.getMenuSlugs()
  }

  // Authors API
  async getAuthor(id: string | number): Promise<ContentAuthor | null> {
    return this.authorsService.getAuthor(id)
  }

  async getAuthorBySlug(slug: string): Promise<ContentAuthor | null> {
    return this.authorsService.getAuthorBySlug(slug)
  }

  async getAuthors(options?: { roles?: string[] }): Promise<ContentAuthor[]> {
    return this.authorsService.getAuthors(options)
  }

  // Media API
  async getMediaById(id: number): Promise<unknown | null> {
    return this.mediaService.getMediaById(id)
  }

  async getMediaByIds(ids: number[]): Promise<unknown[]> {
    return this.mediaService.getMediaByIds(ids)
  }

  getImageUrls(
    mediaItems: WpMediaItem[],
    size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'
  ): string[] {
    return this.mediaService.getImageUrls(mediaItems, size)
  }
}

export { WordPressClient }
