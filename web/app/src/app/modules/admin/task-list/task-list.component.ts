import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Tasks } from '../../model/models';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification-service.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  taskList:any[] = [];
  taskType!:string;
  constructor(
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchAllTaskList();
  }
  fetchAllTaskList(){
    const params: Map<string, any> = new Map();
    this.inventoryService.fetchTaskList(params).subscribe({
      next:(res)=>{
        this.taskList = res.body.data;
        
      },
      error:(err)=>{
        this.notificationService.showMessage("ERROR","Task List Fetch Failed. Error: "+ err.message,"OK",500);
      }
    })
  }
  openTask(task:any){
    if(task.taskType == Tasks.CREATE_INVOICE ||
      task.taskType == Tasks.CREATE_SUPPLY ||
      task.taskType == Tasks.UPDATE_INVOICE ||
      task.taskType == Tasks.UPDATE_SUPPLY){
        this.router.navigate(["/layout/admin/task-details",task.id]);
      }else if (task.taskType == Tasks.CREATE_LOAN) {
        this.router.navigate(["/layout/admin/loan-task-details",task.id]);
      }
      else{
          this.router.navigate(["/layout/admin/tnx-task-details",task.id]);
        }
    
  }
  declineApproval(id:any){
    const params: Map<string, any> = new Map();
    let task = {
      taskId: id
    }
    params.set("task",task)
    this.inventoryService.declineApproval(params).subscribe({
      next:(res)=>{
        this.notificationService.showMessage("SUCCESSFULL","Approval Deleted","OK",500);
      },
      error:(err)=>{
        this.notificationService.showErrorMessage("Warning","Deletion Failed","Ok",500);
      },
      complete:()=>{
        this.fetchAllTaskList();
      }
    })
  }
}
