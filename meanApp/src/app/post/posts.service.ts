import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import {Post} from './post.model';
import {PostAdd} from './postAdd.model';

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts(postsPerPage: number, currentPage: number){
      const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
      this.http
        .get<{ message: string; posts: any; maxPosts: number }>(
          'http://localhost:4000/api/post_list' + queryParams
        )
      .pipe(map((postData) => {
        return{
          posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            creator:post.creator
          };
        }),
        maxPosts: postData.maxPosts
      };
      })
      )
      .subscribe(transformedPostData => {
        console.log(transformedPostData);
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
      }

      getPost(id: string) {
        return this.http.get<{ _id: string; title: string; content: string, creator: string }>(
          'http://localhost:4000/api/post_detail/' + id
        );
      }

      addPost(title: string, content: string) {
        const post: PostAdd = { id: null, title: title, content: content };
        this.http
          .post<{ message: string; post: Post }>(
            'http://localhost:4000/api/add_post',
            post
          )
          .subscribe(responseData => {
            this.router.navigate(['/']);
          });
      }

      deletePost(postId: string) {
        return this.http
        .get('http://localhost:4000/api/posts/' + postId);
      }

      updatePost(id: string, title: string, content: string) {
        const post: PostAdd = { id: id, title: title, content: content };
        this.http
          .put('http://localhost:4000/api/post_edit/' + id, post)
          .subscribe(response => {
            this.router.navigate(['/']);
          });
      }
}
