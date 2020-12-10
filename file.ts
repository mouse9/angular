import { Component, OnInit, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { SharedFileService } from '../../service/shared-file.service';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FolderDetails } from '../../model/folder-details';
import { environment } from '../../../environments/environment';
import { AppSharedService } from '../../core/app-shared-service';
import { FileUploadDetails } from '../../model/file-upload-details';
import { FileDetails } from '../../model/fileDetails';
import { HttpResponse } from '@angular/common/http';
import { ApiResult } from '../../constants/api-results';
import { RestrictedFolderType } from '../../constants/restricted-file-type';

@Component({
  selector: 'app-shared-files',
  templateUrl: './shared-files.component.html',
  styleUrls: ['./shared-files.component.scss'],
  providers: [DatePipe]
})
export class SharedFilesComponent implements OnInit {

  @ViewChild('tableFile', { static: true }) tableFile: ElementRef;
  @ViewChild('uploadBtn', { static: true }) uploadBtn: ElementRef;
  @ViewChild('lightboxUpload', { static: true }) lightboxUpload: ElementRef;
  @ViewChild('addFolderModal', { static: true }) addFolderModal: ElementRef;
  @ViewChild('confirmUploadModal', { static: true }) confirm: ElementRef;
  @ViewChild('uploadFileModal', { static: true }) uploadFileModal: ElementRef;
  @ViewChild('moveFileModal', { static: true }) moveFileModal: ElementRef;
  @ViewChild('newFolder') newFolder: ElementRef;
  @ViewChild('addFolderBtn', { static: true }) addFolderBtn: ElementRef;
  @ViewChild('resetValue', { static: true }) resetValue: ElementRef;
  @ViewChild('deletePermanentlyRowModal', { static: true }) deletePermanentlyRowModal: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @ViewChild('renameFolderModal', { static: true }) renameFolderModal: ElementRef;
  @ViewChild('tableFileName', { static: true }) tableFileName: ElementRef;
  @ViewChild('tableAddedBy', { static: true }) tableAddedBy: ElementRef;
  @ViewChild('tableDateAdded', { static: true }) tableDateAdded: ElementRef;
  @ViewChild('removeFolderModal', { static: true }) removeFolderModal: ElementRef;
  @ViewChild('folderDetailsModal', { static: true }) folderDetailsModal: ElementRef;
  @ViewChild('submitForProcessingModal', { static: true }) submitForProcessingModal: ElementRef;
  @ViewChild('editFileNameModal', { static: true }) editFileNameModal: ElementRef;
  @ViewChild('confirmUploadModal') confirmUploadModal: ElementRef;
  @ViewChild('restoreFileModal', { static: true }) restoreFileModal: ElementRef;
  @ViewChild('confirmSubmitForProcessingModal', { static: true }) confirmSubmitForProcessingModal: ElementRef;

  folderList: Array<FolderDetails>;

  // Need to review and clean up unused variables
  showFileTypeErrMsg = false;
  fileDetails: any;
  multipleFiles: any[] = [];
  columnData = [];
  fileList = [];
  trashData = [];
  newFolderFlag = false;
  showSpinner: boolean;
  // tableConfig: any;
  disableSelectFile = false;
  chkBoxSel = false;
  fileToUpload: File = null;
  showErrMsgNewFld = false;
  showAddFolderErrMsg = false;
  selectedData: any = 'Shared Files';
  // Error message for creating the duplicate Folder in the File Upload screen
  errMsgCreateDupFolder = false;
  displayFileList: any = [];
  // List of folder name in dropdown
  arryListName = [];
  // List of the file types upload file functionality is accepting
  fileTypes = ['BMP', 'PNG', 'PCX', 'JPEG', 'JPG', 'TIFF', 'TIF', 'PDF'];
  // List of the File Name in the table  (Upload file lightbox has); List of FileNames uploaded
  listOfFileNme = [];
  // List of the file name already uploaded (including parent table)
  listOfFileNmeInTable = [];
  // showing Error message for the Duplicate file trying to upload
  errMsgDuplicateFile = false;
  // number of file already uploaded
  lenOfUploadFiles = 0;
  // showing error message in the Duplicate file name which we are trying to upload compared with already uploaded file
  errMsgDupFileNameInTable = false;

  orgRenameFolderName: string;

  newFolderLabel = 'New Folder';
  // added for Fatwire
  public contentId: string;
  public upldInstr: any;
  public termsCondtions: any;

  showAPISerValidationErrMsg = false;
  apiValidationErrorMsg: any;

  fileUploadDetails: FileUploadDetails;
  filesInFldrList: Array<FileDetails>;
  activeFilesList: Array<FileDetails>;
  selectedFile: FileDetails;
  termsOfUseForSubmitProcessing: boolean;
  termsOfUseForSubmitProcessingAlert: boolean;
  errorMsgEditFileName: boolean;

  uploadFileForm: FormGroup;

  // Reactive Form for shared Files Form
  sharedFilesForm: FormGroup;

  // error message for rename folder
  errorMsgRenameFolder = false;

  // this object has the folder details for Modal
  folderDetails: FolderDetails;

  searchFile: string;

  moveFolderOptions = [];

  fileRowDetails: FileDetails;

  uploadedFilesList = [];

  processingOption: string;

  folderId: string;

  sharedFilesData: FileUploadDetails;

  @Output() unreadFileCount = new EventEmitter<any>();
  isUploadFileModalOpened: boolean;

  displayUnreadFileCount: any;
  apiErrorMessage: string;
  errorMsgMissingFileName: boolean;

  // dropdown options for Kabeb Menu
  // dropDownMenu = [];

  dropDownMenu = [
    { label: 'Edit File Name', value: 'Edit File Name' },
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Unread', value: 'Mark as Unread' },
    { label: 'Mark as Favorite', value: 'Mark as Favorite' },
    { label: 'Unmark as Favorite', value: 'Unmark as Favorite' },
    { label: 'Submit for Processing', value: 'Submit for Processing' }
  ];

  dropDownMenuOptions = [
    { label: 'Edit File Name', value: 'Edit File Name' },
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Unmark as Favorite', value: 'Unmark as Favorite' },
    { label: 'Submit for Processing', value: 'Submit for Processing' }
  ];

  dropDownMenuOptionsMarkUnread = [
    { label: 'Edit File Name', value: 'Edit File Name' },
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Unread', value: 'Mark as Unread' },
    { label: 'Unmark as Favorite', value: 'Unmark as Favorite' },
    { label: 'Submit for Processing', value: 'Submit for Processing' }
  ];

  dropDownMenuMarkFavorite = [
    { label: 'Edit File Name', value: 'Edit File Name' },
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Favorite', value: 'Mark as Favorite' },
    { label: 'Submit for Processing', value: 'Submit for Processing' }
  ];

  dropDownMenuMarkFavoriteMarkUnread = [
    { label: 'Edit File Name', value: 'Edit File Name' },
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Unread', value: 'Mark as Unread' },
    { label: 'Mark as Favorite', value: 'Mark as Favorite' },
    { label: 'Submit for Processing', value: 'Submit for Processing' }
  ];

  dropDownMenuForFileSubmitted = [
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Unmark as Favorite', value: 'Unmark as Favorite' }
  ];

  dropDownMenuForFileSubmittedMarkUnread = [
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Unread', value: 'Mark as Unread' },
    { label: 'Unmark as Favorite', value: 'Unmark as Favorite' }
  ];

  dropDownMenuForFileSubmittedMarkFavorite = [
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Favorite', value: 'Mark as Favorite' }
  ];

  dropDownMenuForFileSubmittedMarkFavoriteMarkUnread = [
    { label: 'Download', value: 'Download' },
    { label: 'Move', value: 'Move' },
    { label: 'Trash', value: 'Trash' },
    { label: 'Mark as Unread', value: 'Mark as Unread' },
    { label: 'Mark as Favorite', value: 'Mark as Favorite' }
  ];

  // Trash dropdown options for Kabeb Menu
  trashDropDownMenu = [
    { label: 'Download', value: 'Download' },
    { label: 'Restore', value: 'Restore' },
    { label: 'Permanently Delete', value: 'Permanently Delete' }
  ];

  // dropdown options for Lightbox Select files
  lightboxUploadFiles = [
    { label: 'New Folder', value: 'New Folder' },
    { label: 'Shared Files', value: 'Shared Files', 'selected': true },
    { label: 'Test', value: 'Test' },
    { label: 'Test 1', value: 'Test 1' }
  ];
  fileNameSortDescOrder: boolean;
  fileNameSortAscOrder: boolean;
  dateAddedSortDescOrder: boolean;
  dateAddedSortAscOrder: boolean;
  addedBySortDescOrder: boolean;
  addedBySortAscOrder: boolean;
  markAsUnread: boolean;
  fileKababMenu: boolean;
  trashFileKababMenu: boolean;
  showAlert: boolean;
  folderListData = [];
  constructor(private renderer: Renderer2,
    private sharedFileService: SharedFileService,
    public appSharedService: AppSharedService,
    private datePipe: DatePipe, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initProperties();
    this.initForm();
    this.initChangeHandlers();
    this.loadFolderList();
    this.loadFatWireContentAsHtml();
    this.selectedData = 'Shared Files';
    this.gettableFileName();
    this.gettableAddedBy();
    this.gettableDateAdded();
    this.initMask();

    this.appSharedService.getError().subscribe(message => {
      this.apiErrorMessage = message;
    });
  }

  initProperties() {
    // init all class properties here
    this.markAsUnread = false;
    this.folderDetails = new FolderDetails();
    this.fileKababMenu = false;
    this.trashFileKababMenu = false;
    this.termsOfUseForSubmitProcessing = false;
    this.termsOfUseForSubmitProcessingAlert = false;
    this.errorMsgEditFileName = false;
    this.isUploadFileModalOpened = false;
    this.processingOption = 'yes';
    this.showSpinner = false;
    this.showAlert = false;
    this.errorMsgMissingFileName = false;
  }

  initForm() {
    this.uploadFileForm = new FormGroup({
      comments: new FormControl(''),
      chkBoxConf: new FormControl(false),
      newFolderName: new FormControl(''),
      selectFolder: new FormControl('Shared Files')
    });

    this.sharedFilesForm = this.fb.group({
      folderId: [''],
      newFolderName: [''],
      newRenameFolderName: [''],
      moveTargetFolderId: [''],
      searchFileName: [''],
      fileKababMenu: [''],
      termsOfUseForSubmitProcessing: [false],
      specialHandlingInstructions: [''],
      newFileName: [''],
      restoreTargetFolderId: ['']
    });
  }

  initChangeHandlers() {
    this.sharedFilesForm.get('searchFileName').valueChanges.subscribe(value => {
      this.displayFileList = this.fileList;
      if (!value) {
        this.displayFileList = this.fileList;
      } else {
        let filteredData = this.displayFileList.filter((x) => {
          let filelabel = x.fileLabel.split('.')[0].trim().toLowerCase();
          let temp = value.trim().toLowerCase();
          return filelabel.indexOf(temp) !== -1;
        });
        this.displayFileList = filteredData;
      }
    });

    this.sharedFilesForm.get('folderId').valueChanges.subscribe(value => {
      const folder = this.getMatchingFolderById(value);
      this.sharedFileService.getFileList(value).subscribe((res) => {
        this.fileList = res;
        this.displayFileList = this.fileList;
        this.displayKababMenu(folder?.folderName);
        for (let i = 0; i < this.folderList.length; i++) {
          if (this.folderList[i].activeFolder === true) {
            this.folderList[i].activeFolder = false;
          }
          if (this.folderList[i].folderId === this.sharedFilesForm.get('folderId').value) {
            this.folderList[i].activeFolder = true;
          }
        }
      });
      // this.displayKababMenu(folder.folderName);
    });

    this.sharedFilesForm.get('newFolderName').valueChanges.subscribe(value =>{
      this.showAddFolderErrMsg = false;
    });

    this.sharedFilesForm.get('newRenameFolderName').valueChanges.subscribe(value =>{
      this.errorMsgRenameFolder = false;
    });

    this.sharedFilesForm.get('moveTargetFolderId').valueChanges.subscribe(value =>{
      this.showAPISerValidationErrMsg = false;
    });

    this.sharedFilesForm.get('restoreTargetFolderId').valueChanges.subscribe(value =>{
      this.showAPISerValidationErrMsg = false;
    });

  }

  initMask(){
    document.addEventListener('_ready', function (e) {
      const element = (e.target as HTMLElement);
      if (element.matches('.foldername')) {
        setTimeout(function () {
          // element.masked.mask = /^[a-zA-Z0-9_\- ]*$/;
          element['masked']['mask'] = /^[a-zA-Z0-9_\- ]*$/;
        }, 0);
      } else if (element.matches('.filename')) {
        setTimeout(function () {
          // element.masked.mask = /^[a-zA-Z0-9_\- \.]*$/;
          element['masked']['mask'] = /^[a-zA-Z0-9_\- \.]*$/;
        }, 0);
      }
    });
  }

  displayKababMenu(folderName: string) {
    if (folderName === 'Trash') {
      this.fileKababMenu = false;
      this.trashFileKababMenu = true;
      // this.displayFileList = this.trashData;
    } else {
      this.fileKababMenu = true;
      this.trashFileKababMenu = false;
      this.displayFileList = this.fileList;
    }
  }

  loadFolderList() {
    this.showSpinner = true;
    this.sharedFileService.getFolderList().subscribe((response) => {
      if (response.listOfFolderDetails?.length) {
        this.sharedFilesData = response;
        this.folderList = response.listOfFolderDetails;
        const defaultFolder = this.getActiveFolder();
        this.createDropdownList(defaultFolder.folderId);
        this.sharedFilesForm.get('folderId').setValue(defaultFolder.folderId, { emitEvent: false });
        this.calculateNumberOFUnreadFiles();
        this.fileList = response.activeFolderFilesDetails;
        this.displayFileList = this.fileList;
        this.displayKababMenu(defaultFolder.folderName);
        this.showSpinner = false;
      }
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  loadSpecificFolderList(folderId) {
    this.showSpinner = true;
    this.sharedFileService.getSpecificFolderList(folderId).subscribe((response) => {
      if (response.listOfFolderDetails?.length) {
        this.sharedFilesData = response;
        this.folderList = response.listOfFolderDetails;
        const defaultFolder = this.getActiveFolder();
        this.createDropdownList(defaultFolder.folderId);
        this.sharedFilesForm.get('folderId').setValue(defaultFolder.folderId, { emitEvent: false });
        this.calculateNumberOFUnreadFiles();
        this.fileList = response.activeFolderFilesDetails;
        this.displayFileList = this.fileList;
        this.displayKababMenu(defaultFolder.folderName);
        this.showSpinner = false;
      }
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  loadFavFolderList(folderId) {
    this.showSpinner = true;
    this.sharedFileService.getFavFolderList(folderId).subscribe((response) => {
      if (response.listOfFolderDetails?.length) {
        this.sharedFilesData = response;
        this.folderList = response.listOfFolderDetails;
        const defaultFolder = this.getActiveFolder();
        this.createDropdownList(defaultFolder.folderId);
        this.sharedFilesForm.get('folderId').setValue(defaultFolder.folderId, { emitEvent: false });
        this.calculateNumberOFUnreadFiles();
        this.fileList = response.activeFolderFilesDetails;
        this.displayFileList = this.fileList;
        this.displayKababMenu(defaultFolder.folderName);
        this.showSpinner = false;
      }
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  createDropdownList(activeFolderId) {
    this.folderListData = [];
    let obj;
    for (const folder of this.folderList) {

      if (folder.folderId === activeFolderId) {
        obj = {
          label: folder.folderName + ' (' + folder.unreadFilesCount + ')',
          value: folder.folderId,
          count: folder.unreadFilesCount,
          selected: true
        };
      } else {
        obj = {
          label: folder.folderName + ' (' + folder.unreadFilesCount + ')',
          value: folder.folderId,
          count: folder.unreadFilesCount
        };
      }
      this.folderListData.push(obj);
    }
    console.log('folderListData', this.folderListData);
  }


  calculateNumberOFUnreadFiles() {
    let totalUnreadFiles = 0;
    this.folderList.filter((folder) => {
      if (folder !== null && ((folder.folderName !== RestrictedFolderType.TRASH) && (folder.folderName !== RestrictedFolderType.FAVORITES))) {
        totalUnreadFiles = totalUnreadFiles + (folder.unreadFilesCount);
      }
    });
    this.unreadFileCount.emit(totalUnreadFiles);
  }
  onClickMarkAsFavorite(event, fileRow) {
    let currentFolderId = this.sharedFilesForm.get('folderId').value;
    this.showSpinner = true;
    this.sharedFileService.markFavorite(currentFolderId, fileRow.fileId, fileRow.markedFavorite).subscribe((res) => {
      this.showSpinner = false;
      if (res.apiResult === ApiResult.SUCCESS) {
        if (fileRow.markedFavorite === 'true') {
          fileRow.markedFavorite = 'false';
        } else {
          fileRow.markedFavorite = 'true';
        }
        const favoriteFolder = this.getFavoriteFolder();
        if (favoriteFolder) {
          if (fileRow.markedFavorite === 'true') {
            favoriteFolder.filesCount = favoriteFolder.filesCount + 1;
            if (fileRow.fileRead === true) {
              favoriteFolder.unreadFilesCount = favoriteFolder.unreadFilesCount + 1;
            }
            this.createDropdownList(currentFolderId);
          } else {
            this.loadFavFolderList(currentFolderId);
            favoriteFolder.filesCount = favoriteFolder.filesCount - 1;
            // Atul please use this condition and add respected API call
            // if(favoriteFolder.filesCount === 0){
            //   console.log("favoriteFolder.filesCount" , favoriteFolder.filesCount);
            // }
            // const activeFolder = this.getActiveFolder();
            this.createDropdownList(currentFolderId);
          }
        } else {
          this.loadFavFolderList(currentFolderId);
          // tslint:disable-next-line: no-shadowed-variable
          const favoriteFolder = this.getFavoriteFolder();
          if (favoriteFolder) {
            favoriteFolder.filesCount = favoriteFolder.filesCount + 1;
            if (fileRow.fileRead === true) {
              favoriteFolder.unreadFilesCount = favoriteFolder.unreadFilesCount + 1;
            }
            this.createDropdownList(currentFolderId);
          }
        }

        const activeFolder = this.getActiveFolder();
        if (activeFolder.favoriteFolder) {
          if (fileRow.markedFavorite === 'false') {
            this.displayFileList = this.displayFileList.filter(tdata => tdata !== fileRow);
            // Atul please use this condition and add respected API call
            // if(activeFolder.filesCount === 0){
            //   console.log("favoriteFolder.filesCount" , activeFolder.filesCount);
            // }
          }
        }
      }
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  onClickKababMenu(event, fileRow) {
    this.sharedFilesForm.get('fileKababMenu').reset();
    this.updateDropdown(event, fileRow);
  }

  updateDropdown(event, fileRow) {
    this.dropDownMenu = [];
    if (fileRow.submitFlag !== true && fileRow.specialInstructionFile !== true) {
      if (fileRow.markedFavorite !== 'true') {
        if (fileRow.fileRead === false) {
          this.dropDownMenu = this.dropDownMenuMarkFavorite;
        } else {
          this.dropDownMenu = this.dropDownMenuMarkFavoriteMarkUnread;
        }
      } else {
        if (fileRow.fileRead === false) {
          this.dropDownMenu = this.dropDownMenuOptions;
        } else {
          this.dropDownMenu = this.dropDownMenuOptionsMarkUnread;
        }
      }
    } else if (fileRow.submitFlag === true || fileRow.specialInstructionFile === true) {
      if (fileRow.markedFavorite !== 'true') {
        if (fileRow.fileRead === false) {
          this.dropDownMenu = this.dropDownMenuForFileSubmittedMarkFavorite;
        } else {
          this.dropDownMenu = this.dropDownMenuForFileSubmittedMarkFavoriteMarkUnread;
        }
      } else {
        if (fileRow.fileRead === false) {
          this.dropDownMenu = this.dropDownMenuForFileSubmitted;
        } else {
          this.dropDownMenu = this.dropDownMenuForFileSubmittedMarkUnread;
        }
      }
    }
  }

  // Kabeab Menu Functionality
  onClickKababMenuChange(event, fileRow) {
    this.appSharedService.scrollTop();
    if (event.detail.eventData.value === 'Edit File Name') {
      this.onClickEditFileName(fileRow);
    } else if (event.detail.eventData.value === 'Move') {
      this.onClickMove(fileRow);
    } else if (event.detail.eventData.value === 'Download') {
      this.onClickDownload(fileRow);
    } else if (event.detail.eventData.value === 'Trash') {
      this.onClickTrash(fileRow);
    } else if (event.detail.eventData.value === 'Mark as Unread') {
      this.onClickMarkAsUnread(fileRow);
    } else if (event.detail.eventData.value === 'Mark as Favorite') {
      this.onClickMarkAsFavorite(event, fileRow);
    } else if (event.detail.eventData.value === 'Unmark as Favorite') {
      this.onClickMarkAsFavorite(event, fileRow);
    } else if (event.detail.eventData.value === 'Submit for Processing') {
      this.onClickSubmitForProcessing(fileRow);
    }
  }

  // Kabeab Menu Functionality
  onClickTrashKababMenuChange(event, fileRow) {
    this.appSharedService.scrollTop();
    if (event.detail.eventData.value === 'Download') {
      this.onClickDownload(fileRow);
    } else if (event.detail.eventData.value === 'Permanently Delete') {
      this.onClickPermanentlyDelete(fileRow);
    } else if (event.detail.eventData.value === 'Restore') {
      this.onClickRestore(fileRow);
    }
  }

  onClickEditFileName(fileRow) {
    this.editFileNameModal.nativeElement.toggle();
    this.fileRowDetails = fileRow;
    this.fileDetails = {
      fileName: fileRow.fileLabel,
      fileId: fileRow.fileId,
      markedFavorite: fileRow.markedFavorite
    };
    this.sharedFilesForm.get('newFileName').setValue(this.fileDetails.fileName);
  }

  editFileName(fileRowDetails) {
    let newFileName = this.sharedFilesForm.get('newFileName').value.trim();
    if (newFileName) {
      this.errorMsgMissingFileName = false;
      const folder = this.getMatchingFolderById(this.sharedFilesForm.get('folderId')?.value);
      const metadata = {
        folderName: folder.folderName,
        folderId: this.sharedFilesForm.get('folderId')?.value,
        newFileName: newFileName,
        fileId: this.fileDetails.fileId,
        markedFavorite: this.fileDetails.markedFavorite,
      };

      if (this.displayFileList.find(el => el.fileLabel === newFileName)) {
        this.errorMsgEditFileName = true;
      } else {
        this.errorMsgEditFileName = false;
        this.showSpinner = true;
        this.sharedFileService.editFileName(metadata).subscribe((res) => {
          this.showSpinner = false;
          if (res.apiResult === ApiResult.SUCCESS) {
            this.sharedFilesForm.get('newFileName').reset(this.sharedFilesForm.get('newFileName').value);
            fileRowDetails.fileLabel = newFileName;
            this.editFileNameModal.nativeElement.toggle();
          }
        }, error => {
          this.showSpinner = false;
          this.editFileNameModal.nativeElement.toggle();
          console.error('Error in Rename functionality', error);
        });
      }
    } else {
      this.errorMsgMissingFileName = true;
    }
  }

  cancelEditFileName() {
    this.editFileNameModal.nativeElement.toggle();
    this.errorMsgEditFileName = false;
    this.errorMsgMissingFileName = false;
    this.sharedFilesForm.get('newFileName').reset(this.sharedFilesForm.get('newFileName').value);
  }

  closeMoveFile() {
    this.showAPISerValidationErrMsg = false;
    this.moveFileModal.nativeElement.toggle();
    this.sharedFilesForm.get('moveTargetFolderId').reset('');
  }

  onClickMove(data) {
    this.showAPISerValidationErrMsg = false;
    this.fileRowDetails = data;
    this.moveFolderOptions = this.removeActiveFolder();
    this.moveFileModal.nativeElement.toggle();
  }

  moveFileToOtherFolder(fileRowDetails) {
    this.showAPISerValidationErrMsg = false;
    let metaData = {
      currentFolderId: this.sharedFilesForm.get('folderId').value,
      targetFolderId: this.sharedFilesForm.get('moveTargetFolderId').value,
      fileId: this.fileRowDetails.fileId,
      fileRead: this.fileRowDetails.fileRead
    };
    this.showSpinner = true;
    this.sharedFileService.moveFile(metaData).subscribe((res) => {
      this.showSpinner = false;
      if (res.status === ApiResult.SUCCESS) {
        this.displayFileList = this.displayFileList.filter(tdata => tdata !== fileRowDetails);
        const activeFolder = this.getActiveFolder();
        activeFolder.filesCount = activeFolder.filesCount - 1;
        const targetFolder = this.getMatchingFolderById(this.sharedFilesForm.get('moveTargetFolderId').value);
        targetFolder.filesCount = targetFolder.filesCount + 1;
        if (this.fileRowDetails.fileRead === false) {
          activeFolder.unreadFilesCount = activeFolder.unreadFilesCount - 1;
          targetFolder.unreadFilesCount = targetFolder.unreadFilesCount + 1;
        }
        this.createDropdownList(activeFolder.folderId);
        this.calculateNumberOFUnreadFiles();
        this.moveFileModal.nativeElement.toggle();
      } if (res.status === ApiResult.FAILURE) {
        this.apiValidationErrorMsg = res.errorMessage;
        this.showAPISerValidationErrMsg = true;
      }
    }, error => {
      this.showSpinner = false;
      this.moveFileModal.nativeElement.toggle();
      console.error('Service Error', error);
    });
  }

  onClickTrash(fileRow) {
    this.showAPISerValidationErrMsg = false;
    const targetFolder = this.getTrasholder();
    let metaData = {
      currentFolderId: fileRow.folderId,
      targetFolderId: targetFolder.folderId,
      fileId: fileRow.fileId
    };
    this.showSpinner = true;
    this.sharedFileService.trashFile(metaData).subscribe((res) => {
      this.showSpinner = false;
      if (res.status === ApiResult.SUCCESS) {
        this.displayFileList = this.displayFileList.filter(tdata => tdata !== fileRow);
        const activeFolder = this.getActiveFolder();
        activeFolder.filesCount = activeFolder.filesCount - 1;
        targetFolder.filesCount = targetFolder.filesCount + 1;
        if (fileRow.fileRead === false) {
          activeFolder.unreadFilesCount = activeFolder.unreadFilesCount - 1;
          this.calculateNumberOFUnreadFiles();
          targetFolder.unreadFilesCount = targetFolder.unreadFilesCount + 1;
        }
        this.createDropdownList(activeFolder.folderId);
        this.trashData.push(fileRow);
      }
      this.calculateNumberOFUnreadFiles();
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  onClickMarkAsUnread(fileRow) {
    const markAsReadMetaData = {
      fileId: fileRow.fileId,
      folderId: fileRow.folderId,
      fileRead: fileRow.fileRead
    };
    this.showSpinner = true;
    this.sharedFileService.markUnread(markAsReadMetaData).subscribe((res) => {
      if (res.status === ApiResult.SUCCESS && (fileRow.fileRead === true)) {
        fileRow.fileRead = !fileRow.fileRead;
        // this.updatingUnreadCount(fileRow.fileRead);
        // this.createDropdownList();
        const selectedFolder = this.getActiveFolder();
        selectedFolder.unreadFilesCount = selectedFolder.unreadFilesCount + 1;
        this.createDropdownList(selectedFolder.folderId);
        this.sharedFilesForm.get('folderId').setValue(selectedFolder.folderId, { emitEvent: false });
        this.calculateNumberOFUnreadFiles();
      }
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  // updatingUnreadCount(fileStatus){
  //   this.folderList.map((folder) => {
  //     if(folder.activeFolder === true) {
  //       if(fileStatus === false) {
  //         folder.unreadFilesCount ++;
  //       } else {
  //         folder.unreadFilesCount --;
  //       }
  //     }
  //   });
  //   console.log("unreadFilesCount" , this.folderList);
  // }

  onClickSubmitForProcessing(fileRow) {
    this.selectedFile = fileRow;
    this.submitForProcessingModal.nativeElement.toggle();
  }

  onClickSubmitProcessing(selectedFile) {
    if (this.sharedFilesForm.get('termsOfUseForSubmitProcessing').value) {

      const selectedFileDetails = selectedFile;
      const selectedFolder = this.getMatchingFolderById(selectedFileDetails.folderId);
      const metadata = {
        fileId: selectedFileDetails.fileId,
        fileName: selectedFileDetails.fileLabel,
        folderId: selectedFileDetails.folderId,
        folderName: selectedFolder.folderName,
        comments: this.sharedFilesForm.get('specialHandlingInstructions')?.value,
        submitFlag: true,
      };
      this.showSpinner = true;
      this.sharedFileService.submitFileForProcessing(metadata).subscribe((res) => {
        this.showSpinner = false;
        if (res.apiResult === ApiResult.SUCCESS) {
          this.resetForm();
          this.submitForProcessingModal.nativeElement.toggle();
          this.loadFolderList();
          this.confirmSubmitForProcessingModal.nativeElement.toggle();
          this.fileDetails = selectedFileDetails.fileLabel;
        }
      }, error => {
        this.showSpinner = false;
        this.submitForProcessingModal.nativeElement.toggle();
        console.error('Service Error', error);
      });
    } else {
      if (!this.sharedFilesForm.get('termsOfUseForSubmitProcessing').value) {
        this.termsOfUseForSubmitProcessingAlert = true;
      }
    }
  }

  cancelSubmitForProcessingModal() {
    this.resetForm();
    this.submitForProcessingModal.nativeElement.toggle();
  }

  resetForm() {
    this.sharedFilesForm.get('specialHandlingInstructions').reset();
    this.sharedFilesForm.get('termsOfUseForSubmitProcessing').reset('');
    this.termsOfUseForSubmitProcessingAlert = false;
  }

  loadFatWireContentAsHtml() {
    let termsConditionsUrl = '';
    if (environment.useMockService) {
      termsConditionsUrl = 'assets/mock-data/fatwire/terms-and-conditions.html';
    } else {
      termsConditionsUrl = environment.baseUrl + '/fatwire/ftwrByName/SCV3-TermsConditions';
    }
    this.showSpinner = true;
    this.sharedFileService.getFatWireContent(termsConditionsUrl).subscribe(html => {
      this.showSpinner = false;
      let parser = new DOMParser();
      let termsDoc = parser.parseFromString(html, 'text/html');
      this.termsCondtions = termsDoc.getElementById('termsCond').innerHTML;
    }, error => {
      this.showSpinner = false;
      console.error('GetFatWireData Service Error', error);
    });
  }

  onClickDownload(fileRow) {
    const metadata = {
      fileId: fileRow.fileId,
      folderId: fileRow.folderId
    };
    this.showSpinner = true;
    this.sharedFileService.downloadFile(metadata).subscribe((res: HttpResponse<Blob>) => {
      this.showSpinner = false;
      if (environment.useMockService) {
        if (res.status === 200) {
          if (fileRow.fileRead === false) {
            fileRow.fileRead = true;
            const markAsReadMetaData = {
              fileId: fileRow.fileId,
              folderId: fileRow.folderId,
              fileRead: fileRow.fileRead
            };
            this.sharedFileService.markAsRead(markAsReadMetaData).subscribe((response) => {
              if (response.status === ApiResult.SUCCESS) {
                // this.updatingUnreadCount(fileRow.fileRead);
                // this.createDropdownList();
                const activeFolder = this.getActiveFolder();
                activeFolder.unreadFilesCount = activeFolder.unreadFilesCount - 1;
                this.createDropdownList(activeFolder.folderId);
                this.sharedFilesForm.get('folderId').setValue(activeFolder.folderId, { emitEvent: false });
                this.calculateNumberOFUnreadFiles();

              }
            });
          }
        }
      } else {
        let data = res.body;
        let contentDisposition = res.headers.get('content-disposition');
        let fileName = '';
        if (contentDisposition) {
          const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = fileNameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
        }
        let blob = new Blob([data], { type: 'octet/stream' });
        let downloadURL = window.URL.createObjectURL(data);
        let link = document.createElement('a');
        link.href = downloadURL;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
        if (res.status === 200) {
          if (fileRow.fileRead === false) {
            fileRow.fileRead = true;
            const markAsReadMetaData = {
              fileId: fileRow.fileId,
              folderId: fileRow.folderId,
              fileRead: fileRow.fileRead
            };
            this.sharedFileService.markAsRead(markAsReadMetaData).subscribe((response) => {
              if (response.status === ApiResult.SUCCESS) {
                const activeFolder = this.getActiveFolder();
                activeFolder.unreadFilesCount = activeFolder.unreadFilesCount - 1;
                this.createDropdownList(activeFolder.folderId);
                this.sharedFilesForm.get('folderId').setValue(activeFolder.folderId, { emitEvent: false });
                this.calculateNumberOFUnreadFiles();
              }
            });
          }
        }
      }
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  onClickPermanentlyDelete(fileRow) {
    this.deletePermanentlyRowModal.nativeElement.toggle();
    this.fileRowDetails = fileRow;
  }

  deleteFilePermanently(fileRowDetails) {
    let currentFolderId = this.sharedFilesForm.get('folderId').value;
    let fileId = fileRowDetails.fileId;
    this.showSpinner = true;
    this.sharedFileService.deletePermanentlyFile(currentFolderId, fileId).subscribe((res) => {
      this.showSpinner = false;
      if (res.apiResult === 'success') {
        this.deletePermanentlyRowModal.nativeElement.toggle();
        this.fileDetails = fileRowDetails.fileLabel;
        this.displayFileList = this.displayFileList.filter(tdata => tdata !== fileRowDetails);
      }
    }, error => {
      this.showSpinner = false;
      console.error('Service Error', error);
    });
  }

  onClickRestore(fileRow) {
    this.showAPISerValidationErrMsg = false;
    this.fileRowDetails = fileRow;
    this.moveFolderOptions = this.removeActiveFolder();
    this.restoreFileModal.nativeElement.toggle();
  }

  restoreFileToOtherFolder(fileRowDetails) {
    this.showAPISerValidationErrMsg = false;
    this.showAlert = false;
    if (this.sharedFilesForm.get('restoreTargetFolderId').value) {
      this.showAlert = false;
      let metaData = {
        currentFolderId: this.fileRowDetails.folderId,
        targetFolderId: this.sharedFilesForm.get('restoreTargetFolderId').value,
        fileId: this.fileRowDetails.fileId,
        fileRead: this.fileRowDetails.fileRead
      };
      this.showSpinner = true;
      this.sharedFileService.restoreFile(metaData).subscribe((res) => {
        this.showSpinner = false;
        if (res.status === ApiResult.SUCCESS) {
          this.displayFileList = this.displayFileList.filter(tdata => tdata !== fileRowDetails);
          const activeFolder = this.getActiveFolder();
          activeFolder.filesCount = activeFolder.filesCount - 1;
          const targetFolder = this.getMatchingFolderById(this.sharedFilesForm.get('restoreTargetFolderId').value);
          targetFolder.filesCount = targetFolder.filesCount + 1;
          if (this.fileRowDetails.fileRead === false) {
            activeFolder.unreadFilesCount = activeFolder.unreadFilesCount - 1;
            targetFolder.unreadFilesCount = targetFolder.unreadFilesCount + 1;
          }
          this.createDropdownList(activeFolder.folderId);
          this.calculateNumberOFUnreadFiles();
          this.closeRestoreFile();
        } if (res.status === ApiResult.FAILURE) {
          this.apiValidationErrorMsg = res.errorMessage;
          this.showAPISerValidationErrMsg = true;
        }
      }, error => {
        this.showSpinner = false;
        this.closeRestoreFile();
        console.error('Service Error', error);
      });
    } else {
      this.showAlert = true;
    }
  }

  closeRestoreFile() {
    this.showAPISerValidationErrMsg = false;
    this.showAlert = false;
    this.sharedFilesForm.get('restoreTargetFolderId').setValue('');
    this.restoreFileModal.nativeElement.toggle();
  }


  removeTableHeader() {
    if (this.multipleFiles.length === 0) {
      this.renderer.addClass(this.tableFile.nativeElement, 'd-none');
    }
  }

  listOfFolders(addFolder) {
    return this.arryListName.includes(addFolder.toLowerCase().trim());
  }

  cancelAddFolder() {
    this.showAPISerValidationErrMsg = false;
    this.showAddFolderErrMsg = false;
    this.addFolderModal.nativeElement.toggle();
    this.sharedFilesForm.get('newFolderName').setValue('');
  }


  renameFolderName() {
    this.showAPISerValidationErrMsg = false;
    this.errorMsgRenameFolder = false;
    let renameFolderName = this.sharedFilesForm.get('newRenameFolderName').value.trim();
    const folder = this.getMatchingFolderById(this.sharedFilesForm.get('folderId')?.value);
    const metadata = {
      folderName: this.sharedFilesForm.get('newRenameFolderName').value.trim(),
      folderId: this.sharedFilesForm.get('folderId')?.value,
      activeFolderId: this.sharedFilesForm.get('folderId')?.value,
      renameFolderName: renameFolderName,
    };

    if (this.getMatchingFolderByName(renameFolderName) || renameFolderName.toLowerCase() === 'favorites') {
      this.errorMsgRenameFolder = true;
    } else {
      this.showSpinner = true;
      this.sharedFileService.renameFolder(metadata).subscribe((res) => {
        this.showSpinner = false;
        if (res.apiResult === ApiResult.SUCCESS) {
          this.folderList.map((folderfilter) => {
            if (folderfilter.folderId === folder.folderId) {
              folderfilter.folderName = this.sharedFilesForm.get('newRenameFolderName').value;
            }
          });
          this.loadSpecificFolderList(metadata.folderId);
          this.sharedFilesForm.get('newRenameFolderName').reset();
          this.renameFolderModal.nativeElement.toggle();
        } else if (res.apiResult === ApiResult.FAILURE) {
          this.apiValidationErrorMsg = res.errorMessage;
          this.showAPISerValidationErrMsg = true;
        }
      }, error => {
        this.showSpinner = false;
        this.renameFolderModal.nativeElement.toggle();
        console.error('Error in Rename functionality', error);
      });
    }
  }

  removeFolder() {
    let folderId = this.sharedFilesForm.get('folderId')?.value;
    this.showSpinner = true;
    this.sharedFileService.removeFolder(folderId).subscribe((res) => {
      this.showSpinner = false;
      if (res.apiResult === ApiResult.SUCCESS) {
        this.removeFolderModal.nativeElement.toggle();
        this.loadFolderList();
      }

    }, error => {
      this.showSpinner = false;
      this.removeFolderModal.nativeElement.toggle();
      console.error('Error in Remove Folder functionality', error);
    });

  }

  openFolderDetailsModal() {
    this.folderDetails = this.getMatchingFolderById(this.sharedFilesForm.get('folderId')?.value);
    this.folderDetailsModal.nativeElement.toggle();
  }

  openRenameFolderModal() {
    const folder = this.getMatchingFolderById(this.sharedFilesForm.get('folderId')?.value);
    this.sharedFilesForm.get('newRenameFolderName').setValue(folder.folderName);
    this.renameFolderModal.nativeElement.toggle();
  }

  cancelRenameFolder() {
    this.renameFolderModal.nativeElement.toggle();
    this.errorMsgRenameFolder = false;
    this.showAPISerValidationErrMsg = false;
    this.sharedFilesForm.get('newRenameFolderName').reset(this.sharedFilesForm.get('newRenameFolderName').value);
  }

  onOpenUploadFileModal() {
    this.isUploadFileModalOpened = true;
  }

  onCloseUploadFileModal(event) {
    this.isUploadFileModalOpened = false;
    if (event.action === 'CANCELLED') {
      this.uploadFileModal.nativeElement.toggle();
    } else if (event.action === 'UPLOADED') {
      this.uploadedFilesList = event.uploadedFilesList;
      this.processingOption = event.processingOption;
      this.folderId = event.folderId;
      this.uploadFileModal.nativeElement.toggle();
      this.confirmUploadModal.nativeElement.toggle();
    }
  }

  onClickCloseUploadFileModal(event) {
    console.log(event, event.target.id);
    if (event.target.id === 'uploadFileModal') {
      this.isUploadFileModalOpened = false;
    }
  }

  closeConfirmationModal(folderId) {
    this.confirmUploadModal.nativeElement.toggle();
    this.loadSpecificFolderList(folderId);
  }

  gettableFileName() {
    let tableFileNameElem = this.tableFileName.nativeElement;
    let tableFileNameorder = tableFileNameElem.getAttribute('data-order');
    if (tableFileNameorder === 'desc') {
      this.fileNameSortAscOrder = false;
      this.fileNameSortDescOrder = true;
    } else {
      this.fileNameSortDescOrder = false;
      this.fileNameSortAscOrder = true;
    }
  }

  gettableAddedBy() {
    let tableFileAddedByElem = this.tableAddedBy.nativeElement;
    let tableAddedByorder = tableFileAddedByElem.getAttribute('data-order');
    if (tableAddedByorder === 'desc') {
      this.addedBySortAscOrder = false;
      this.addedBySortDescOrder = true;
    } else {
      this.addedBySortDescOrder = false;
      this.addedBySortAscOrder = true;
    }
  }

  gettableDateAdded() {
    let tableFileDateAddedElem = this.tableDateAdded.nativeElement;
    let tableDateAddedorder = tableFileDateAddedElem.getAttribute('data-order');
    if (tableDateAddedorder === 'desc') {
      this.dateAddedSortAscOrder = false;
      this.dateAddedSortDescOrder = true;
    } else {
      this.dateAddedSortDescOrder = false;
      this.dateAddedSortAscOrder = true;
    }
  }

  onClickPrint() {
    window.print();
  }

  addNewFolder() {
    this.showAddFolderErrMsg = false;
    this.showAPISerValidationErrMsg = false;
    const newFolderName = this.sharedFilesForm.get('newFolderName')?.value;
    console.log(' newFolderName:', newFolderName);
    if (this.getMatchingFolderByName(newFolderName) || newFolderName.toLowerCase().trim() === 'favorites') {
      this.showAddFolderErrMsg = true;
    }
    if (!this.showAddFolderErrMsg) {
      this.showSpinner = true;
      this.sharedFileService.addNewFolder(newFolderName).subscribe(response => {
        this.showSpinner = false;
        const fileUploadDetails = response;
        if (fileUploadDetails.apiResult === ApiResult.SUCCESS) {
          this.folderList = response.listOfFolderDetails;
          const defaultFolder = this.getActiveFolder();
          this.createDropdownList(defaultFolder.folderId);
          this.sharedFilesForm.get('folderId').setValue(defaultFolder.folderId, { emitEvent: true });
          this.displayFileList = response.activeFolderFilesDetails;
          this.addFolderModal.nativeElement.toggle(); // closing the add folder lightbox
          this.sharedFilesForm.get('newFolderName').setValue('');
        }
        if (fileUploadDetails.apiResult === 'failure') {
          this.apiValidationErrorMsg = fileUploadDetails.errorMessage;
          this.showAPISerValidationErrMsg = true;
        }
      }, error => {
        this.showSpinner = false;
        this.addFolderModal.nativeElement.toggle();
        console.error('Service Error', error);
        // TODO: Handle using GWF error handler
      });

    }

  }

  getMatchingFolderById(folderId: string): FolderDetails {
    return this.folderList?.find(folder => folder.folderId === folderId);
  }

  getMatchingFolderByName(folderName: string): FolderDetails {
    return this.folderList?.find(folder => folder.folderName.toLowerCase().trim() === folderName.toLowerCase().trim());
  }

  getActiveFolder(): FolderDetails {
    return this.folderList?.find(folder => folder.activeFolder === true);
  }

  removeActiveFolder() {
    return this.folderList?.filter(folder => (folder.activeFolder !== true && folder.favoriteFolder !== true && folder.trashFolder !== true));
  }

  getFavoriteFolder() {
    return this.folderList?.find(folder => folder.favoriteFolder === true);
  }

  getTrasholder() {
    return this.folderList?.find(folder => folder.trashFolder === true);
  }

  isRestrictedFolder(): boolean {
    const folder = this.getMatchingFolderById(this.sharedFilesForm.get('folderId')?.value);
    return folder?.folderName === 'Shared Files' || folder?.folderName === 'Favorites' ||
      folder?.folderName === 'Trash';
  }

}
